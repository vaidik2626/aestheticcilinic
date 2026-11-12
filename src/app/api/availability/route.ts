import { NextResponse, type NextRequest } from "next/server";
import { getAvailableDates, getSlotsForDate } from "@/lib/booking-service";
import { isDatabaseConfigured } from "@/lib/prisma";
import { availabilityQuerySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = availabilityQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Consulta no válida." }, { status: 400 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "El servicio de reservas no está disponible." }, { status: 503 });
  }

  try {
    const { treatmentId, date, month } = parsed.data;
    const result = date ? await getSlotsForDate(treatmentId, date) : await getAvailableDates(treatmentId, month!);
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/availability]", error);
    return NextResponse.json({ error: "El servicio de reservas no está disponible." }, { status: 503 });
  }
}
