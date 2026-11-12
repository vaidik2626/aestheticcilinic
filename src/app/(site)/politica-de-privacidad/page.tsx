import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { pageMetadata } from "@/lib/seo";
import { fullAddress, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidad",
  description: `Política de tratamiento de datos personales del ${site.name}.`,
  path: "/politica-de-privacidad",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      lead="Cómo tratamos los datos personales que nos compartes al solicitar una cita o contactarnos."
      sections={[
        {
          heading: "Responsable del tratamiento",
          body: [`${site.name}, con domicilio en ${fullAddress}. Canal de contacto: WhatsApp ${site.whatsapp.display}.`],
        },
        {
          heading: "Datos que recopilamos",
          body: [
            "Al solicitar una cita recopilamos tu nombre completo, correo electrónico, número de WhatsApp, el tratamiento elegido, la fecha y hora solicitadas y, de forma opcional, un mensaje.",
            "No solicitamos información médica sensible a través del formulario web. Cualquier información de salud necesaria se tratará en tu valoración presencial.",
          ],
        },
        {
          heading: "Finalidad",
          body: [
            "Usamos tus datos únicamente para gestionar tu solicitud de cita, contactarte para confirmarla o reprogramarla y enviarte información relacionada con tu atención.",
          ],
        },
        {
          heading: "Marco legal",
          body: [
            "El tratamiento se realiza conforme a la Ley Estatutaria 1581 de 2012 de protección de datos personales de Colombia y sus decretos reglamentarios, con tu autorización previa, expresa e informada.",
          ],
        },
        {
          heading: "Tus derechos",
          body: [
            "Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, así como revocar la autorización otorgada, escribiéndonos por WhatsApp.",
          ],
        },
        {
          heading: "Conservación y seguridad",
          body: [
            "Conservamos tus datos durante el tiempo necesario para la finalidad descrita y aplicamos medidas técnicas razonables para protegerlos. El acceso al sistema de reservas está restringido al personal autorizado.",
          ],
        },
      ]}
    />
  );
}
