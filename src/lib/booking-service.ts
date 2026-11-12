import "server-only";
import { randomInt } from "node:crypto";
import { computeDaySlots, isDateInWindow, type BookingRules, type Interval } from "@/lib/availability";
import { sendBookingEmails } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { addDaysKey, bogotaStartOfDay, daysInMonth, toBogotaDateKey } from "@/lib/time";
import { createBookingSchema, fieldErrors } from "@/lib/validations";
import type { Prisma } from "@/generated/prisma/client";
import type { BookingConfirmation, CreateBookingResult, TimeSlot } from "@/types/booking";

type Db = Prisma.TransactionClient | typeof prisma;

/** Clave fija de bloqueo consultivo: serializa la creación de reservas. */
const BOOKING_LOCK_KEY = 72_024_100;

export async function getBookingRules(db: Db = prisma) {
  return db.bookingSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
}

/** Carga horario, citas activas y bloqueos que afectan a un rango de fechas. */
async function loadCalendar(db: Db, fromDate: string, toDate: string) {
  const from = bogotaStartOfDay(fromDate);
  const to = bogotaStartOfDay(addDaysKey(toDate, 1));
  const [ranges, bookings, timeOff] = await Promise.all([
    db.availabilityRule.findMany({ where: { active: true }, select: { weekday: true, startTime: true, endTime: true } }),
    db.booking.findMany({
      where: { status: { in: ["PENDING", "CONFIRMED"] }, startsAt: { lt: to }, blockedUntil: { gt: from } },
      select: { startsAt: true, blockedUntil: true },
    }),
    db.timeOff.findMany({
      where: { startsAt: { lt: to }, endsAt: { gt: from } },
      select: { startsAt: true, endsAt: true },
    }),
  ]);
  return {
    ranges,
    bookings: bookings.map<Interval>((b) => ({ start: b.startsAt, end: b.blockedUntil })),
    timeOff: timeOff.map<Interval>((t) => ({ start: t.startsAt, end: t.endsAt })),
  };
}

async function getBookableTreatment(db: Db, treatmentId: string) {
  return db.treatment.findFirst({ where: { id: treatmentId, active: true } });
}

export type AvailabilityResponse =
  | { ok: true; slots: TimeSlot[] }
  | { ok: true; dates: string[] }
  | { ok: false; status: number; message: string };

export async function getSlotsForDate(treatmentId: string, date: string): Promise<AvailabilityResponse> {
  const [settings, treatment] = await Promise.all([getBookingRules(), getBookableTreatment(prisma, treatmentId)]);
  if (!settings.onlineBookingActive) return { ok: false, status: 503, message: "La reserva en línea no está activa." };
  if (!treatment) return { ok: false, status: 404, message: "Tratamiento no disponible." };
  const calendar = await loadCalendar(prisma, date, date);
  return {
    ok: true,
    slots: computeDaySlots({ date, durationMinutes: treatment.durationMinutes, rules: settings, ...calendar }),
  };
}

export async function getAvailableDates(treatmentId: string, month: string): Promise<AvailabilityResponse> {
  const [settings, treatment] = await Promise.all([getBookingRules(), getBookableTreatment(prisma, treatmentId)]);
  if (!settings.onlineBookingActive) return { ok: false, status: 503, message: "La reserva en línea no está activa." };
  if (!treatment) return { ok: false, status: 404, message: "Tratamiento no disponible." };
  const days = daysInMonth(month).filter((d) => isDateInWindow(d, settings));
  if (!days.length) return { ok: true, dates: [] };
  const calendar = await loadCalendar(prisma, days[0], days[days.length - 1]);
  const dates = days.filter(
    (date) => computeDaySlots({ date, durationMinutes: treatment.durationMinutes, rules: settings, ...calendar }).length > 0,
  );
  return { ok: true, dates };
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateReference() {
  let s = "";
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `CH-${s}`;
}

function toConfirmation(
  b: {
    reference: string;
    status: BookingConfirmation["status"];
    treatmentName: string;
    startsAt: Date;
    endsAt: Date;
    fullName: string;
    email: string;
    whatsapp: string;
  },
  emailSent: boolean,
): BookingConfirmation {
  return {
    reference: b.reference,
    status: b.status,
    treatmentName: b.treatmentName,
    startsAt: b.startsAt.toISOString(),
    endsAt: b.endsAt.toISOString(),
    fullName: b.fullName,
    email: b.email,
    whatsapp: b.whatsapp,
    emailSent,
  };
}

function isOverlapViolation(error: unknown) {
  const text = error instanceof Error ? `${error.message} ${JSON.stringify(error)}` : String(error);
  return text.includes("Booking_no_overlap") || text.includes("23P01");
}

function isUniqueViolation(error: unknown, field: string) {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; meta?: unknown; message?: string };
  return e.code === "P2002" && JSON.stringify(e.meta ?? e.message ?? "").includes(field);
}

class SlotUnavailableError extends Error {}

export async function createBooking(raw: unknown): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Revisa los datos del formulario.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }
  const input = parsed.data;

  // Reintento de la misma solicitud (doble clic, red inestable): devolver la reserva ya creada.
  const existing = await prisma.booking.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) return { ok: true, booking: toConfirmation(existing, Boolean(existing.emailSentAt)) };

  const ip = await clientIp();
  if (!(await rateLimit(`booking:${ip}`, 5, 60 * 60))) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      message: "Has enviado varias solicitudes seguidas. Inténtalo más tarde o escríbenos por WhatsApp.",
    };
  }

  const startsAt = new Date(input.startsAt);
  const date = toBogotaDateKey(startsAt);

  let created;
  try {
    created = await prisma.$transaction(async (tx) => {
      // Serializa las reservas concurrentes durante la verificación e inserción.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BOOKING_LOCK_KEY})`;

      const settings: BookingRules & { onlineBookingActive: boolean } = await getBookingRules(tx);
      const treatment = await getBookableTreatment(tx, input.treatmentId);
      if (!settings.onlineBookingActive || !treatment) throw new SlotUnavailableError("UNAVAILABLE");

      const calendar = await loadCalendar(tx, date, date);
      const slots = computeDaySlots({ date, durationMinutes: treatment.durationMinutes, rules: settings, ...calendar });
      if (!slots.some((s) => new Date(s.startsAt).getTime() === startsAt.getTime())) {
        throw new SlotUnavailableError("SLOT_TAKEN");
      }

      const endsAt = new Date(startsAt.getTime() + treatment.durationMinutes * 60_000);
      const blockedUntil = new Date(endsAt.getTime() + settings.bufferMinutes * 60_000);

      for (let attempt = 0; attempt < 5; attempt++) {
        const reference = generateReference();
        const clash = await tx.booking.findUnique({ where: { reference }, select: { id: true } });
        if (clash) continue;
        return tx.booking.create({
          data: {
            reference,
            idempotencyKey: input.idempotencyKey,
            treatmentId: treatment.id,
            treatmentName: treatment.name,
            startsAt,
            endsAt,
            blockedUntil,
            fullName: input.fullName,
            email: input.email,
            whatsapp: input.whatsapp,
            message: input.message || null,
            consentAt: new Date(),
          },
        });
      }
      throw new Error("No fue posible generar una referencia única.");
    });
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return error.message === "UNAVAILABLE"
        ? { ok: false, code: "UNAVAILABLE", message: "Este tratamiento no está disponible para reserva en línea en este momento." }
        : { ok: false, code: "SLOT_TAKEN", message: "Ese horario acaba de ocuparse. Elige otro, por favor." };
    }
    if (isOverlapViolation(error)) {
      return { ok: false, code: "SLOT_TAKEN", message: "Ese horario acaba de ocuparse. Elige otro, por favor." };
    }
    if (isUniqueViolation(error, "idempotencyKey")) {
      const dup = await prisma.booking.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (dup) return { ok: true, booking: toConfirmation(dup, Boolean(dup.emailSentAt)) };
    }
    console.error("[booking] error al crear la reserva:", error);
    return {
      ok: false,
      code: "SERVICE_DOWN",
      message: "No pudimos registrar tu solicitud. Tu cita no ha sido guardada; inténtalo de nuevo o escríbenos por WhatsApp.",
    };
  }

  // El correo se envía después de confirmar la escritura; un fallo de correo no anula la reserva.
  let emailSent = false;
  try {
    emailSent = await sendBookingEmails(created);
    if (emailSent) await prisma.booking.update({ where: { id: created.id }, data: { emailSentAt: new Date() } });
  } catch (error) {
    console.error("[booking] error al enviar correo:", error);
  }

  return { ok: true, booking: toConfirmation(created, emailSent) };
}
