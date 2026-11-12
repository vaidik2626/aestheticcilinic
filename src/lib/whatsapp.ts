import { site } from "@/lib/site";
import type { TreatmentCategory } from "@/types/treatment";

export const whatsappMessages = {
  general: "Hola, me gustaría recibir información sobre sus tratamientos.",
  appointment: "Hola, quisiera consultar disponibilidad para reservar una cita.",
  FACIAL: "Hola, estoy interesada en un tratamiento facial. ¿Podrían brindarme más información?",
  CORPORAL: "Hola, estoy interesada en un tratamiento corporal. ¿Podrían brindarme más información?",
  POSTOPERATORIO:
    "Hola, quisiera información sobre los cuidados postoperatorios. ¿Podrían orientarme?",
  ASESORAMIENTO:
    "Hola, me gustaría recibir asesoramiento estético. ¿Podrían brindarme más información?",
} as const satisfies Record<string, string> & Record<TreatmentCategory, string>;

export type WhatsappMessageKey = keyof typeof whatsappMessages;

/** Enlace click-to-chat con mensaje precargado (funciona en escritorio y móvil). */
export function whatsappUrl(message?: string, phone: string = site.whatsapp.phone) {
  if (!message) return site.whatsapp.link;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function whatsappFor(key: WhatsappMessageKey, phone?: string) {
  return whatsappUrl(whatsappMessages[key], phone);
}

export function whatsappAfterBooking(reference: string, phone?: string) {
  return whatsappUrl(
    `Hola, acabo de realizar una solicitud de cita. Mi número de referencia es ${reference}.`,
    phone,
  );
}
