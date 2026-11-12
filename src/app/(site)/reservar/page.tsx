import type { Metadata } from "next";
import { BookingUnavailable } from "@/components/booking/booking-unavailable";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { PageHeader } from "@/components/layout/page-header";
import { getBookingCatalog, getSiteContent } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { TREATMENT_CATEGORIES, type TreatmentCategory } from "@/types/treatment";

export const metadata: Metadata = pageMetadata({
  title: "Reservar cita",
  description:
    "Solicita tu cita en el Centro Estético Claudia Hernández en Bogotá: elige tratamiento, fecha y hora en pocos pasos.",
  path: "/reservar",
});

// La disponibilidad cambia constantemente: siempre renderizar en el servidor.
export const dynamic = "force-dynamic";

export default async function BookingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [catalog, { contact }] = await Promise.all([getBookingCatalog(), getSiteContent()]);

  const rawCategory = typeof params.categoria === "string" ? params.categoria.toUpperCase() : null;
  const initialCategory = TREATMENT_CATEGORIES.includes(rawCategory as TreatmentCategory) ? (rawCategory as TreatmentCategory) : null;
  const initialTreatmentId = typeof params.tratamiento === "string" ? params.tratamiento : null;

  return (
    <>
      <PageHeader
        eyebrow="Reservar"
        title={<>Reserva <em className="font-light text-primary">tu cita.</em></>}
        lead="Elige tratamiento, fecha y hora. Revisaremos tu solicitud y te contactaremos para confirmarla."
      />
      <section aria-label="Formulario de reserva" className="pb-28 md:pb-40">
        <div className="container-x">
          {catalog.onlineBookingActive ? (
            <BookingWizard
              treatments={catalog.treatments}
              whatsappPhone={contact.whatsappPhone}
              initialCategory={initialCategory}
              initialTreatmentId={initialTreatmentId}
            />
          ) : (
            <BookingUnavailable whatsappPhone={contact.whatsappPhone} reason={catalog.available ? "inactive" : "down"} />
          )}
        </div>
      </section>
    </>
  );
}
