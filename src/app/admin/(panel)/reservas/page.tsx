import type { Metadata } from "next";
import Link from "next/link";
import { updateBookingStatus } from "@/app/admin/actions";
import { AdminPageTitle } from "@/components/admin/page-title";
import { StatusBadge } from "@/components/admin/status-badge";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { addDaysKey, bogotaStartOfDay, formatShortDate, formatTime } from "@/lib/time";
import { BOOKING_STATUSES, bookingStatusLabel, type BookingStatus } from "@/types/booking";

export const metadata: Metadata = { title: "Reservas" };

const PAGE_SIZE = 30;
const isDate = (v?: string) => Boolean(v && /^\d{4}-\d{2}-\d{2}$/.test(v));

export default async function BookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const status = BOOKING_STATUSES.includes(sp.estado as BookingStatus) ? (sp.estado as BookingStatus) : undefined;
  const treatmentId = sp.tratamiento || undefined;
  const from = isDate(sp.desde) ? sp.desde : undefined;
  const to = isDate(sp.hasta) ? sp.hasta : undefined;
  const page = Math.max(1, Number(sp.pagina) || 1);

  const where: Prisma.BookingWhereInput = {
    ...(status && { status }),
    ...(treatmentId && { treatmentId }),
    ...((from || to) && {
      startsAt: {
        ...(from && { gte: bogotaStartOfDay(from) }),
        ...(to && { lt: bogotaStartOfDay(addDaysKey(to, 1)) }),
      },
    }),
    ...(q && {
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { whatsapp: { contains: q } },
        { reference: { contains: q.toUpperCase() } },
      ],
    }),
  };

  const [bookings, count, treatments] = await Promise.all([
    prisma.booking.findMany({ where, orderBy: { startsAt: from || to ? "asc" : "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.booking.count({ where }),
    prisma.treatment.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const qs = (p: number) => {
    const params = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    params.set("pagina", String(p));
    return `?${params.toString()}`;
  };

  return (
    <>
      <AdminPageTitle title="Reservas" description={`${count} ${count === 1 ? "reserva" : "reservas"} encontradas.`} />

      <form className="mb-6 grid gap-3 border hairline bg-white p-4 md:grid-cols-6" role="search">
        <label className="md:col-span-2">
          <span className="sr-only">Buscar</span>
          <input name="q" defaultValue={q} placeholder="Nombre, correo, teléfono o referencia" className="admin-input" />
        </label>
        <label>
          <span className="sr-only">Estado</span>
          <select name="estado" defaultValue={status ?? ""} className="admin-input">
            <option value="">Todos los estados</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{bookingStatusLabel[s]}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Tratamiento</span>
          <select name="tratamiento" defaultValue={treatmentId ?? ""} className="admin-input">
            <option value="">Todos los tratamientos</option>
            {treatments.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted">
          Desde <input type="date" name="desde" defaultValue={from} className="admin-input" />
        </label>
        <label className="flex items-center gap-2 text-xs text-muted">
          Hasta <input type="date" name="hasta" defaultValue={to} className="admin-input" />
        </label>
        <div className="flex gap-2 md:col-span-6">
          <button type="submit" className="rounded-sm bg-primary-dark px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-background">Filtrar</button>
          <Link href="/admin/reservas" className="rounded-sm border hairline bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]">Limpiar</Link>
        </div>
      </form>

      <div className="overflow-x-auto border hairline bg-white">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b hairline bg-surface/50 text-xs uppercase tracking-[0.1em] text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Cita</th>
              <th scope="col" className="px-4 py-3 font-semibold">Clienta</th>
              <th scope="col" className="px-4 py-3 font-semibold">Tratamiento</th>
              <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
              <th scope="col" className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">No hay reservas con estos filtros.</td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id} className="align-top hover:bg-surface/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/reservas/${b.id}`} className="font-medium underline-offset-2 hover:underline">
                    {formatShortDate(b.startsAt)} · {formatTime(b.startsAt)}
                  </Link>
                  <p className="mt-0.5 font-mono text-xs text-muted">{b.reference}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{b.fullName}</p>
                  <p className="text-xs text-muted">{b.email} · {b.whatsapp}</p>
                </td>
                <td className="px-4 py-3">{b.treatmentName}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {b.status === "PENDING" && <QuickStatus id={b.id} status="CONFIRMED" label="Confirmar" />}
                    {b.status === "CONFIRMED" && <QuickStatus id={b.id} status="COMPLETED" label="Completar" />}
                    {(b.status === "PENDING" || b.status === "CONFIRMED") && <QuickStatus id={b.id} status="CANCELLED" label="Cancelar" danger />}
                    <Link href={`/admin/reservas/${b.id}`} className="rounded-sm border hairline px-2.5 py-1 text-xs">Ver</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav aria-label="Paginación" className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted">Página {page} de {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs(page - 1)} className="rounded-sm border hairline bg-white px-3 py-1.5">Anterior</Link>}
            {page < pages && <Link href={qs(page + 1)} className="rounded-sm border hairline bg-white px-3 py-1.5">Siguiente</Link>}
          </div>
        </nav>
      )}
    </>
  );
}

function QuickStatus({ id, status, label, danger }: { id: string; status: BookingStatus; label: string; danger?: boolean }) {
  return (
    <form action={updateBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={
          danger
            ? "rounded-sm px-2.5 py-1 text-xs font-semibold text-[#a24a3a] hover:bg-[#a24a3a]/10"
            : "rounded-sm bg-primary-dark px-2.5 py-1 text-xs font-semibold text-background hover:bg-primary"
        }
      >
        {label}
      </button>
    </form>
  );
}
