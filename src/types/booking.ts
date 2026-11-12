import type { PublicTreatment, TreatmentCategory } from "@/types/treatment";

export const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const bookingStatusLabel: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

export interface TimeSlot {
  /** Instante de inicio en ISO (UTC). */
  startsAt: string;
  /** "HH:MM" en hora de Bogotá. */
  label: string;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  whatsapp: string;
  message: string;
  consent: boolean;
}

export interface BookingDraft {
  category: TreatmentCategory | null;
  treatment: PublicTreatment | null;
  date: string | null;
  slot: TimeSlot | null;
  customer: CustomerDetails;
}

export interface BookingConfirmation {
  reference: string;
  status: BookingStatus;
  treatmentName: string;
  startsAt: string;
  endsAt: string;
  fullName: string;
  email: string;
  whatsapp: string;
  emailSent: boolean;
}

export type CreateBookingResult =
  | { ok: true; booking: BookingConfirmation }
  | {
      ok: false;
      code: "VALIDATION" | "SLOT_TAKEN" | "UNAVAILABLE" | "RATE_LIMITED" | "SERVICE_DOWN";
      message: string;
      fieldErrors?: Record<string, string>;
    };
