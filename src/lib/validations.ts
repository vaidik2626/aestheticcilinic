import { z } from "zod";
import { BOOKING_STATUSES } from "@/types/booking";
import { TREATMENT_CATEGORIES } from "@/types/treatment";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida");
const monthKey = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mes no válido");
const timeKey = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora no válida (HH:MM)");
const checkbox = z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean());

export const availabilityQuerySchema = z
  .object({
    treatmentId: z.string().min(1).max(64),
    date: dateKey.optional(),
    month: monthKey.optional(),
  })
  .refine((v) => Boolean(v.date) !== Boolean(v.month), "Indica una fecha o un mes");

export const customerSchema = z.object({
  fullName: z.string().trim().min(3, "Escribe tu nombre completo").max(120, "El nombre es demasiado largo"),
  email: z.string().trim().toLowerCase().max(160, "Correo demasiado largo").pipe(z.email("Escribe un correo válido")),
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s().-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{7,15}$/, "Escribe un número de WhatsApp válido")),
  message: z.string().trim().max(600, "El mensaje admite hasta 600 caracteres").optional().default(""),
  consent: z.literal(true, { error: "Debes aceptar la política de privacidad" }),
});

export const createBookingSchema = customerSchema.extend({
  treatmentId: z.string().min(1).max(64),
  startsAt: z.iso.datetime({ offset: true, error: "Horario no válido" }),
  idempotencyKey: z.uuid("Solicitud no válida"),
  // Campo trampa anti-spam: debe llegar vacío.
  website: z.string().max(0).optional().default(""),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Correo no válido")),
  password: z.string().min(1, "Escribe tu contraseña").max(200),
});

export const treatmentSchema = z.object({
  id: z.string().optional(),
  category: z.enum(TREATMENT_CATEGORIES, { error: "Elige una categoría" }),
  name: z.string().trim().min(2, "Nombre demasiado corto").max(120),
  description: z.string().trim().max(600).default(""),
  durationMinutes: z.coerce.number().int().min(10, "Mínimo 10 minutos").max(480, "Máximo 8 horas"),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  active: checkbox,
});

export const availabilityRuleSchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    startTime: timeKey,
    endTime: timeKey,
  })
  .refine((v) => v.endTime > v.startTime, {
    message: "La hora final debe ser posterior a la inicial",
    path: ["endTime"],
  });

export const timeOffSchema = z
  .object({
    date: dateKey,
    endDate: z.union([dateKey, z.literal("")]).optional(),
    allDay: checkbox,
    startTime: z.union([timeKey, z.literal("")]).optional(),
    endTime: z.union([timeKey, z.literal("")]).optional(),
    reason: z.string().trim().max(160).optional().default(""),
  })
  .refine((v) => v.allDay || (v.startTime && v.endTime && v.endTime > v.startTime), {
    message: "Indica una franja horaria válida",
    path: ["endTime"],
  })
  .refine((v) => !v.allDay || !v.endDate || v.endDate >= v.date, {
    message: "La fecha final debe ser igual o posterior a la inicial",
    path: ["endDate"],
  });

export const bookingSettingsSchema = z.object({
  onlineBookingActive: checkbox,
  slotIntervalMinutes: z.coerce.number().int().min(5).max(240),
  bufferMinutes: z.coerce.number().int().min(0).max(240),
  minNoticeHours: z.coerce.number().int().min(0).max(24 * 14),
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),
});

export const bookingStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(BOOKING_STATUSES),
});

export const galleryImageSchema = z.object({
  id: z.string().optional(),
  src: z
    .string()
    .trim()
    .min(1, "Indica la ruta de la imagen")
    .max(500)
    .refine((v) => v.startsWith("/") || v.startsWith("https://"), "Usa una ruta local (/images/...) o una URL https"),
  alt: z.string().trim().min(3, "Describe la imagen (texto alternativo)").max(200),
  label: z.string().trim().max(60).default(""),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  active: checkbox,
});

export const testimonialSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().trim().min(2, "Nombre demasiado corto").max(40),
  text: z.string().trim().min(10, "Testimonio demasiado corto").max(600),
  category: z.union([z.enum(TREATMENT_CATEGORIES), z.literal("")]).optional(),
  consentConfirmed: checkbox,
  published: checkbox,
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

/** Convierte un ZodError en un mapa campo → primer mensaje. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
