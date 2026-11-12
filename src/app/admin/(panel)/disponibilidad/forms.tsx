"use client";

import { useState } from "react";
import { addAvailabilityRule, addTimeOff, saveBookingSettings } from "@/app/admin/actions";
import { ActionForm, Field, FormMessage, SubmitButton } from "@/components/admin/form";
import { WEEKDAY_LABELS } from "@/lib/time";

export function RuleForm() {
  return (
    <ActionForm action={addAvailabilityRule} className="grid items-end gap-3 sm:grid-cols-4">
      {(state) => (
        <>
          <Field label="Día" name="rule-weekday" error={state.errors?.weekday}>
            <select id="rule-weekday" name="weekday" defaultValue="1" className="admin-input">
              {WEEKDAY_LABELS.map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Desde" name="rule-start" error={state.errors?.startTime}>
            <input id="rule-start" name="startTime" type="time" defaultValue="09:00" step={300} className="admin-input" />
          </Field>
          <Field label="Hasta" name="rule-end" error={state.errors?.endTime}>
            <input id="rule-end" name="endTime" type="time" defaultValue="13:00" step={300} className="admin-input" />
          </Field>
          <SubmitButton>Añadir franja</SubmitButton>
          <div className="sm:col-span-4"><FormMessage state={state} /></div>
        </>
      )}
    </ActionForm>
  );
}

export function TimeOffForm() {
  const [allDay, setAllDay] = useState(true);
  return (
    <ActionForm action={addTimeOff} resetOnSuccess className="grid items-end gap-3 sm:grid-cols-4">
      {(state) => (
        <>
          <label className="flex items-center gap-2 text-sm sm:col-span-4">
            <input type="checkbox" name="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="size-4 accent-[var(--primary-dark)]" />
            Bloquear días completos
          </label>
          <Field label={allDay ? "Desde el día" : "Día"} name="to-date" error={state.errors?.date}>
            <input id="to-date" name="date" type="date" required className="admin-input" />
          </Field>
          {allDay ? (
            <Field label="Hasta el día (opcional)" name="to-end-date" error={state.errors?.endDate}>
              <input id="to-end-date" name="endDate" type="date" className="admin-input" />
            </Field>
          ) : (
            <>
              <Field label="Desde" name="to-start" error={state.errors?.startTime}>
                <input id="to-start" name="startTime" type="time" step={300} className="admin-input" />
              </Field>
              <Field label="Hasta" name="to-end" error={state.errors?.endTime}>
                <input id="to-end" name="endTime" type="time" step={300} className="admin-input" />
              </Field>
            </>
          )}
          <Field label="Motivo (interno)" name="to-reason" className={allDay ? "sm:col-span-2" : ""}>
            <input id="to-reason" name="reason" maxLength={160} placeholder="Vacaciones, festivo…" className="admin-input" />
          </Field>
          <div className="flex items-center gap-4 sm:col-span-4">
            <SubmitButton>Añadir bloqueo</SubmitButton>
            <FormMessage state={state} />
          </div>
        </>
      )}
    </ActionForm>
  );
}

interface Settings {
  onlineBookingActive: boolean;
  slotIntervalMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
}

export function SettingsForm({ value }: { value: Settings }) {
  return (
    <ActionForm action={saveBookingSettings} className="grid gap-4 sm:grid-cols-2">
      {(state) => (
        <>
          <label className="flex items-start gap-3 border hairline bg-surface/40 p-4 text-sm sm:col-span-2">
            <input type="checkbox" name="onlineBookingActive" defaultChecked={value.onlineBookingActive} className="mt-0.5 size-4 accent-[var(--primary-dark)]" />
            <span>
              <strong className="font-semibold">Reserva en línea activa</strong>
              <span className="block text-xs text-muted">Si está desactivada, la página de reservas ofrece reservar por WhatsApp.</span>
            </span>
          </label>
          <Field label="Intervalo entre horarios (min)" name="s-interval" hint="Cada cuánto empieza una franja" error={state.errors?.slotIntervalMinutes}>
            <input id="s-interval" name="slotIntervalMinutes" type="number" min={5} max={240} step={5} defaultValue={value.slotIntervalMinutes} className="admin-input" />
          </Field>
          <Field label="Margen entre citas (min)" name="s-buffer" hint="Tiempo de preparación tras cada cita" error={state.errors?.bufferMinutes}>
            <input id="s-buffer" name="bufferMinutes" type="number" min={0} max={240} step={5} defaultValue={value.bufferMinutes} className="admin-input" />
          </Field>
          <Field label="Antelación mínima (horas)" name="s-notice" error={state.errors?.minNoticeHours}>
            <input id="s-notice" name="minNoticeHours" type="number" min={0} max={336} defaultValue={value.minNoticeHours} className="admin-input" />
          </Field>
          <Field label="Reservas hasta (días)" name="s-advance" hint="Días hacia el futuro que se pueden reservar" error={state.errors?.maxAdvanceDays}>
            <input id="s-advance" name="maxAdvanceDays" type="number" min={1} max={365} defaultValue={value.maxAdvanceDays} className="admin-input" />
          </Field>
          <div className="flex items-center gap-4 sm:col-span-2">
            <SubmitButton>Guardar configuración</SubmitButton>
            <FormMessage state={state} />
          </div>
        </>
      )}
    </ActionForm>
  );
}
