import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Política de reservas",
  description: `Cómo funcionan las solicitudes de cita en el ${site.name}.`,
  path: "/politica-de-reservas",
});

export default function BookingPolicyPage() {
  return (
    <LegalPage
      title="Política de reservas"
      lead="Cómo funcionan las solicitudes de cita realizadas a través de nuestro sitio web."
      sections={[
        {
          heading: "Solicitudes de cita",
          body: [
            "Al completar la reserva en línea se registra una solicitud de cita con un número de referencia. La solicitud queda en estado pendiente hasta que el centro la confirme por WhatsApp o correo electrónico.",
          ],
        },
        {
          heading: "Confirmación",
          body: [
            "Una cita se considera confirmada únicamente cuando el centro te lo comunica. El horario solicitado queda reservado mientras la solicitud está pendiente de revisión.",
          ],
        },
        {
          heading: "Pagos",
          body: ["El sitio web no procesa pagos ni anticipos. Cualquier condición de pago te será informada directamente por el centro."],
        },
        {
          heading: "Cambios y cancelaciones",
          body: [
            "Si necesitas cambiar o cancelar tu cita, escríbenos por WhatsApp indicando tu número de referencia con la mayor antelación posible.",
            "[Pendiente] El centro debe definir aquí su política de antelación para cancelaciones y reprogramaciones.",
          ],
        },
        {
          heading: "Valoración previa",
          body: [
            "La realización de cualquier tratamiento está sujeta a la valoración profesional. En el caso de cuidados postoperatorios, se tendrán en cuenta las indicaciones de tu médico tratante.",
          ],
        },
      ]}
    />
  );
}
