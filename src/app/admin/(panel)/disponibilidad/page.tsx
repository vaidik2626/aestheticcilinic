import type { Metadata } from "next";
import { deleteAvailabilityRule, deleteTimeOff } from "@/app/admin/actions";
import { RuleForm, SettingsForm, TimeOffForm } from "@/app/admin/(panel)/disponibilidad/forms";
import { ConfirmButton } from "@/components/admin/form";
import { AdminPageTitle, Panel } from "@/components/admin/page-title";
import { getBookingRules } from "@/lib/booking-service";
import { prisma } from "@/lib/prisma";
import { addDaysKey, formatShortDate, formatTime, toBogotaDateKey, WEEKDAY_LABELS } from "@/lib/time";

export const metadata: Metadata = { title: "Disponibilidad" };

export default async function AvailabilityPage() {
  const [settings, rules, timeOff] = await Promise.all([
    getBookingRules(),
    prisma.availabilityRule.findMany({ orderBy: [{ weekday: "asc" }, { startTime: "asc" }] }),
    prisma.timeOff.findMany({ where: { endsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } }),
  ]);
  // Mostrar la semana empezando en lunes.
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <>
      <AdminPageTitle
        title="Disponibilidad"
        description="Horario semanal, bloqueos y reglas de reserva. Todas las horas están en hora de Bogotá."
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Horario semanal">
          <ul className="mb-6 divide-y divide-ink/10 text-sm">
            {order.map((d) => {
              const list = rules.filter((r) => r.weekday === d);
              return (
                <li key={d} className="flex flex-wrap items-center gap-3 py-2.5">
                  <span className="w-24 font-medium">{WEEKDAY_LABELS[d]}</span>
                  {list.length === 0 ? (
                    <span className="text-muted">Cerrado</span>
                  ) : (
                    list.map((r) => (
                      <form key={r.id} action={deleteAvailabilityRule} className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1">
                        <input type="hidden" name="id" value={r.id} />
                        <span className="tabular-nums">{r.startTime}–{r.endTime}</span>
                        <ConfirmButton message="¿Eliminar esta franja?" className="!text-ink/50 hover:!text-[#a24a3a]">
                          <span aria-label={`Eliminar franja ${r.startTime}–${r.endTime}`}>×</span>
                        </ConfirmButton>
                      </form>
                    ))
                  )}
                </li>
              );
            })}
          </ul>
          <RuleForm />
        </Panel>

        <Panel title="Reglas de reserva">
          <SettingsForm value={settings} />
        </Panel>

        <Panel title="Fechas y franjas bloqueadas" className="xl:col-span-2">
          {timeOff.length > 0 ? (
            <ul className="mb-6 divide-y divide-ink/10 text-sm">
              {timeOff.map((t) => {
                const lastDay = addDaysKey(toBogotaDateKey(t.endsAt), -1);
                const label = t.allDay
                  ? toBogotaDateKey(t.startsAt) === lastDay
                    ? formatShortDate(t.startsAt)
                    : `${formatShortDate(t.startsAt)} → ${formatShortDate(new Date(t.endsAt.getTime() - 1))}`
                  : `${formatShortDate(t.startsAt)} · ${formatTime(t.startsAt)}–${formatTime(t.endsAt)}`;
                return (
                  <li key={t.id} className="flex items-center gap-4 py-2.5">
                    <span className="font-medium">{label}</span>
                    <span className="flex-1 text-muted">{t.reason}</span>
                    <form action={deleteTimeOff}>
                      <input type="hidden" name="id" value={t.id} />
                      <ConfirmButton message="¿Eliminar este bloqueo?">Eliminar</ConfirmButton>
                    </form>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mb-6 text-sm text-muted">No hay bloqueos próximos.</p>
          )}
          <TimeOffForm />
        </Panel>
      </div>
    </>
  );
}
