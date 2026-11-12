import { NextResponse } from "next/server";
import { createBooking } from "@/lib/booking-service";
import { isDatabaseConfigured } from "@/lib/prisma";
import type { CreateBookingResult } from "@/types/booking";

export const dynamic = "force-dynamic";

const statusFor: Record<Exclude<CreateBookingResult, { ok: true }>["code"], number> = {
  VALIDATION: 422,
  SLOT_TAKEN: 409,
  UNAVAILABLE: 409,
  RATE_LIMITED: 429,
  SERVICE_DOWN: 503,
};

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    const body: CreateBookingResult = {
      ok: false,
      code: "SERVICE_DOWN",
      message: "La reserva en línea no está disponible. Tu cita no ha sido guardada; escríbenos por WhatsApp.",
    };
    return NextResponse.json(body, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "VALIDATION", message: "Solicitud no válida." }, { status: 400 });
  }

  try {
    const result = await createBooking(payload);
    return NextResponse.json(result, { status: result.ok ? 201 : statusFor[result.code] });
  } catch (error) {
    console.error("[api/bookings]", error);
    const body: CreateBookingResult = {
      ok: false,
      code: "SERVICE_DOWN",
      message: "No pudimos registrar tu solicitud. Tu cita no ha sido guardada; inténtalo de nuevo o escríbenos por WhatsApp.",
    };
    return NextResponse.json(body, { status: 503 });
  }
}
