"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, requireAdmin, verifyCredentials } from "@/lib/auth";
import { parseSiteContent, siteContentSchema } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { bogotaDateTime, addDaysKey } from "@/lib/time";
import {
  availabilityRuleSchema,
  bookingSettingsSchema,
  bookingStatusSchema,
  fieldErrors,
  galleryImageSchema,
  loginSchema,
  testimonialSchema,
  timeOffSchema,
  treatmentSchema,
} from "@/lib/validations";

export interface ActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

const form = (fd: FormData) => Object.fromEntries(fd.entries());

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

function revalidatePublic() {
  revalidatePath("/", "layout");
}

/* ─── Sesión ────────────────────────────────────────────────────────────── */

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(form(fd));
  if (!parsed.success) return { message: "Revisa los datos.", errors: fieldErrors(parsed.error) };

  const ip = await clientIp();
  const allowedIp = await rateLimit(`login:ip:${ip}`, 10, 15 * 60);
  const allowedUser = await rateLimit(`login:user:${parsed.data.email}`, 5, 15 * 60);
  if (!allowedIp || !allowedUser) {
    return { message: "Demasiados intentos. Espera unos minutos antes de volver a intentarlo." };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return { message: "Correo o contraseña incorrectos." };

  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ─── Reservas ──────────────────────────────────────────────────────────── */

export async function updateBookingStatus(fd: FormData) {
  await requireAdmin();
  const parsed = bookingStatusSchema.safeParse(form(fd));
  if (!parsed.success) return;
  try {
    await prisma.booking.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  } catch (error) {
    // Reactivar una cita cancelada puede chocar con otra ya existente (restricción EXCLUDE).
    console.error("[admin] cambio de estado:", error);
    redirect(`/admin/reservas/${parsed.data.id}?error=conflicto`);
  }
  revalidatePath("/admin", "layout");
}

export async function updateBookingNotes(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const notes = String(fd.get("adminNotes") ?? "").slice(0, 2000);
  await prisma.booking.update({ where: { id }, data: { adminNotes: notes || null } });
  revalidatePath(`/admin/reservas/${id}`);
  return { ok: true, message: "Notas guardadas." };
}

/* ─── Tratamientos ──────────────────────────────────────────────────────── */

export async function saveTreatment(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = treatmentSchema.safeParse(form(fd));
  if (!parsed.success) return { message: "Revisa los campos marcados.", errors: fieldErrors(parsed.error) };
  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.treatment.update({ where: { id }, data });
  } else {
    let slug = slugify(data.name) || "tratamiento";
    if (await prisma.treatment.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    await prisma.treatment.create({ data: { ...data, slug } });
  }
  revalidatePath("/admin/tratamientos");
  revalidatePublic();
  return { ok: true, message: id ? "Tratamiento actualizado." : "Tratamiento creado." };
}

export async function deleteTreatment(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const bookings = await prisma.booking.count({ where: { treatmentId: id } });
  if (bookings > 0) {
    // Conservar el histórico: desactivar en lugar de eliminar.
    await prisma.treatment.update({ where: { id }, data: { active: false } });
  } else {
    await prisma.treatment.delete({ where: { id } });
  }
  revalidatePath("/admin/tratamientos");
  revalidatePublic();
}

/* ─── Disponibilidad ────────────────────────────────────────────────────── */

export async function addAvailabilityRule(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = availabilityRuleSchema.safeParse(form(fd));
  if (!parsed.success) return { message: "Revisa el horario.", errors: fieldErrors(parsed.error) };
  const { weekday, startTime, endTime } = parsed.data;

  const overlapping = await prisma.availabilityRule.findFirst({
    where: { weekday, startTime: { lt: endTime }, endTime: { gt: startTime } },
  });
  if (overlapping) return { message: "Esa franja se superpone con otra del mismo día." };

  await prisma.availabilityRule.create({ data: parsed.data });
  revalidatePath("/admin/disponibilidad");
  revalidatePath("/reservar");
  return { ok: true, message: "Franja añadida." };
}

export async function deleteAvailabilityRule(fd: FormData) {
  await requireAdmin();
  await prisma.availabilityRule.delete({ where: { id: String(fd.get("id") ?? "") } });
  revalidatePath("/admin/disponibilidad");
}

export async function addTimeOff(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = timeOffSchema.safeParse(form(fd));
  if (!parsed.success) return { message: "Revisa el bloqueo.", errors: fieldErrors(parsed.error) };
  const { date, endDate, allDay, startTime, endTime, reason } = parsed.data;

  const startsAt = allDay ? bogotaDateTime(date, "00:00") : bogotaDateTime(date, startTime!);
  const endsAt = allDay ? bogotaDateTime(addDaysKey(endDate || date, 1), "00:00") : bogotaDateTime(date, endTime!);
  await prisma.timeOff.create({ data: { startsAt, endsAt, allDay, reason: reason || null } });
  revalidatePath("/admin/disponibilidad");
  return { ok: true, message: "Bloqueo añadido." };
}

export async function deleteTimeOff(fd: FormData) {
  await requireAdmin();
  await prisma.timeOff.delete({ where: { id: String(fd.get("id") ?? "") } });
  revalidatePath("/admin/disponibilidad");
}

export async function saveBookingSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = bookingSettingsSchema.safeParse(form(fd));
  if (!parsed.success) return { message: "Revisa la configuración.", errors: fieldErrors(parsed.error) };
  if (parsed.data.onlineBookingActive && (await prisma.availabilityRule.count({ where: { active: true } })) === 0) {
    return { message: "Añade al menos una franja de horario antes de activar la reserva en línea." };
  }
  await prisma.bookingSettings.upsert({ where: { id: "default" }, update: parsed.data, create: { id: "default", ...parsed.data } });
  revalidatePath("/admin/disponibilidad");
  revalidatePath("/reservar");
  return { ok: true, message: "Configuración guardada." };
}

/* ─── Contenido ─────────────────────────────────────────────────────────── */

export async function saveSiteContent(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const current = parseSiteContent((await prisma.siteContent.findUnique({ where: { id: "default" } }))?.content);
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const candidate = {
    contact: {
      whatsappPhone: get("contact.whatsappPhone").replace(/\D/g, ""),
      whatsappDisplay: get("contact.whatsappDisplay"),
      email: get("contact.email"),
      hoursNote: get("contact.hoursNote"),
    },
    home: {
      heroHeadline: get("home.heroHeadline"),
      heroText: get("home.heroText"),
      introHeadline: get("home.introHeadline"),
      introBody: get("home.introBody"),
      editorialText: get("home.editorialText"),
    },
    about: {
      introduction: get("about.introduction"),
      background: get("about.background"),
      philosophy: get("about.philosophy"),
      approach: get("about.approach"),
      portraitSrc: get("about.portraitSrc"),
    },
  };
  const parsed = siteContentSchema.safeParse({ ...current, ...candidate });
  if (!parsed.success) return { message: "Revisa los campos marcados.", errors: fieldErrors(parsed.error) };
  if (parsed.data.about.portraitSrc && !/^(\/|https:\/\/)/.test(parsed.data.about.portraitSrc)) {
    return { message: "La imagen del retrato debe ser una ruta local o una URL https.", errors: { "about.portraitSrc": "Ruta no válida" } };
  }
  await prisma.siteContent.upsert({
    where: { id: "default" },
    update: { content: parsed.data },
    create: { id: "default", content: parsed.data },
  });
  revalidatePublic();
  return { ok: true, message: "Contenido publicado." };
}

export async function saveGalleryImage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = galleryImageSchema.safeParse(form(fd));
  if (!parsed.success) return { message: "Revisa la imagen.", errors: fieldErrors(parsed.error) };
  const { id, ...data } = parsed.data;
  if (id) await prisma.galleryImage.update({ where: { id }, data });
  else await prisma.galleryImage.create({ data });
  revalidatePath("/admin/contenido");
  revalidatePublic();
  return { ok: true, message: id ? "Imagen actualizada." : "Imagen añadida." };
}

export async function deleteGalleryImage(fd: FormData) {
  await requireAdmin();
  await prisma.galleryImage.delete({ where: { id: String(fd.get("id") ?? "") } });
  revalidatePath("/admin/contenido");
  revalidatePublic();
}

export async function saveTestimonial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(form(fd));
  if (!parsed.success) return { message: "Revisa el testimonio.", errors: fieldErrors(parsed.error) };
  const { id, category, ...data } = parsed.data;
  if (data.published && !data.consentConfirmed) {
    return { message: "Solo se pueden publicar testimonios con autorización confirmada.", errors: { consentConfirmed: "Requerido para publicar" } };
  }
  const payload = { ...data, category: category || null };
  if (id) await prisma.testimonial.update({ where: { id }, data: payload });
  else await prisma.testimonial.create({ data: payload });
  revalidatePath("/admin/contenido");
  revalidatePublic();
  return { ok: true, message: id ? "Testimonio actualizado." : "Testimonio guardado." };
}

export async function deleteTestimonial(fd: FormData) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id: String(fd.get("id") ?? "") } });
  revalidatePath("/admin/contenido");
  revalidatePublic();
}
