import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { updateBookingStatus } from "@/app/admin/actions";
import { BookingNotes } from "@/app/admin/(panel)/reservas/[id]/notes";
import { AdminPageTitle, Panel } from "@/components/admin/page-title";
import { StatusBadge } from "@/components/admin/status-badge";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { prisma } from "@/lib/prisma";
import { formatLongDate, formatShortDate, formatTime } from "@/lib/time";
import { whatsappUrl } from "@/lib/whatsapp";
import { BOOKING_STATUSES, bookingStatusLabel } from "@/types/booking";

export const metadata: Metadata = { title: "Detalle de reserva" };

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b) notFound();

  const firstName = b.fullName.split(" ")[0];
  const phone = b.whatsapp.replace(/\D/g, "");
  const contactMessage = `Hola ${firstName}, te escribimos del Centro Estético Claudia Hernández sobre tu solicitud de cita ${b.reference} para el ${formatLongDate(b.startsAt)} a las ${formatTime(b.startsAt)}.`;

  const rows = [
    ["Referencia", b.reference],
    ["Tratamiento", b.treatmentName],
    ["Fecha", formatLongDate(b.startsAt)],
    ["Hora", `${formatTime(b.startsAt)} – ${formatTime(b.endsAt)}`],
    ["Nombre", b.fullName],
    ["Correo", b.email],
    ["WhatsApp", b.whatsapp],
    ["Mensaje", b.message ?? "—"],
    ["Consentimiento", formatShortDate(b.consentAt)],
    ["Correo enviado", b.emailSentAt ? formatShortDate(b.emailSentAt) : "No"],
    ["Creada", `${formatShortDate(b.createdAt)} · ${formatTime(b.createdAt)}`],
  ];

  return (
    <>
      <Link href="/admin/reservas" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} aria-hidden /> Volver a reservas
      </Link>
      <AdminPageTitle title={b.fullName} description={`${b.treatmentName} · ${formatShortDate(b.startsAt)} ${formatTime(b.startsAt)}`}>
        <StatusBadge status={b.status} />
      </AdminPageTitle>

      {error === "conflicto" && (
        <p role="alert" className="mb-6 border border-[#a24a3a]/30 bg-[#a24a3a]/5 p-4 text-sm text-[#7d3a2e]">
          No se pudo cambiar el estado: el horario se superpone con otra cita activa.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Datos de la reserva" className="lg:col-span-2">
          <dl className="divide-y divide-ink/10 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-4 py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="col-span-2 whitespace-pre-wrap break-words first-letter:uppercase">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="space-y-6">
          <Panel title="Estado">
            <div className="grid grid-cols-2 gap-2">
              {BOOKING_STATUSES.map((s) => (
                <form key={s} action={updateBookingStatus}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    disabled={b.status === s}
                    className="w-full rounded-sm border hairline px-3 py-2 text-xs font-semibold transition-colors hover:border-primary-dark disabled:border-primary-dark disabled:bg-primary-dark disabled:text-background"
                  >
                    {bookingStatusLabel[s]}
                  </button>
                </form>
              ))}
            </div>
          </Panel>

          <Panel title="Contactar">
            <div className="flex flex-col gap-2 text-sm">
              <a href={whatsappUrl(contactMessage, phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-primary-dark px-3 py-2.5 text-background">
                <WhatsappIcon size={15} /> Escribir por WhatsApp
              </a>
              <a href={`mailto:${b.email}?subject=${encodeURIComponent(`Tu cita ${b.reference}`)}`} className="inline-flex items-center gap-2 rounded-sm border hairline px-3 py-2.5">
                <Mail size={15} aria-hidden /> Enviar correo
              </a>
            </div>
          </Panel>

          <Panel title="Notas internas">
            <BookingNotes id={b.id} notes={b.adminNotes ?? ""} />
          </Panel>
        </div>
      </div>
    </>
  );
}
