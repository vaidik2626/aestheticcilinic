import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AdminPageTitle, Panel } from "@/components/admin/page-title";
import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured } from "@/lib/email";
import { formatShortDate, formatTime } from "@/lib/time";

export const metadata: Metadata = { title: "Resumen" };

export default async function DashboardPage() {
  const now = new Date();
  const [total, pending, confirmed, completed, upcoming, settings, rules] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.findMany({
      where: { status: { in: ["PENDING", "CONFIRMED"] }, startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 8,
    }),
    prisma.bookingSettings.findUnique({ where: { id: "default" } }),
    prisma.availabilityRule.count({ where: { active: true } }),
  ]);

  const stats = [
    { label: "Reservas totales", value: total, href: "/admin/reservas" },
    { label: "Pendientes", value: pending, href: "/admin/reservas?estado=PENDING" },
    { label: "Confirmadas", value: confirmed, href: "/admin/reservas?estado=CONFIRMED" },
    { label: "Completadas", value: completed, href: "/admin/reservas?estado=COMPLETED" },
  ];

  const warnings = [
    !settings?.onlineBookingActive && "La reserva en línea está desactivada. Las clientas verán la opción de reservar por WhatsApp.",
    rules === 0 && "No hay horario semanal configurado.",
    !isEmailConfigured() && "El envío de correos no está configurado (RESEND_API_KEY / EMAIL_FROM).",
  ].filter(Boolean) as string[];

  return (
    <>
      <AdminPageTitle title="Resumen" description="Estado general de las reservas y la configuración del sitio." />

      {warnings.length > 0 && (
        <div className="mb-8 space-y-2 border border-[#d9b98a] bg-[#fbf3e6] p-4 text-sm text-[#6b4f1d]">
          {warnings.map((w) => (
            <p key={w} className="flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden /> {w}
            </p>
          ))}
          <p className="pt-1">
            <Link href="/admin/disponibilidad" className="font-semibold underline">Ir a disponibilidad</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="border hairline bg-white p-5 transition-colors hover:border-primary">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{s.label}</p>
            <p className="mt-3 font-display text-5xl text-primary-dark">{s.value}</p>
          </Link>
        ))}
      </div>

      <Panel title="Próximas citas" className="mt-8">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">No hay citas próximas.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {upcoming.map((b) => (
              <li key={b.id}>
                <Link href={`/admin/reservas/${b.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3 text-sm hover:bg-surface/50">
                  <span className="w-32 font-medium tabular-nums">
                    {formatShortDate(b.startsAt)} · {formatTime(b.startsAt)}
                  </span>
                  <span className="min-w-40 flex-1">{b.fullName}</span>
                  <span className="text-muted">{b.treatmentName}</span>
                  <StatusBadge status={b.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
