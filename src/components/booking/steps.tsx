"use client";

import { motion } from "framer-motion";
import { CalendarPlus, Check, Clock, Download, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { categoryByKey, treatmentCategories } from "@/data/treatments";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import { formatDateKey, formatLongDate, formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { customerSchema, fieldErrors } from "@/lib/validations";
import { whatsappAfterBooking } from "@/lib/whatsapp";
import type { BookingConfirmation, BookingDraft, CustomerDetails, TimeSlot } from "@/types/booking";
import { bookingStatusLabel } from "@/types/booking";
import type { PublicTreatment, TreatmentCategory } from "@/types/treatment";

export function StepHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mb-10">
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h2 className="mt-4 font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] text-primary-dark focus:outline-none" tabIndex={-1} data-step-title>
        {title}
      </h2>
      {text && <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-ink/70">{text}</p>}
    </div>
  );
}

/* ─── Paso 1: servicio ──────────────────────────────────────────────────── */

export function StepService({
  treatments,
  category,
  treatment,
  onCategory,
  onTreatment,
}: {
  treatments: PublicTreatment[];
  category: TreatmentCategory | null;
  treatment: PublicTreatment | null;
  onCategory: (c: TreatmentCategory) => void;
  onTreatment: (t: PublicTreatment) => void;
}) {
  const available = treatmentCategories.filter((c) => treatments.some((t) => t.category === c.category));
  const list = treatments.filter((t) => t.category === category);

  return (
    <div>
      <StepHeading eyebrow="Paso 1 de 5" title="¿Qué experiencia buscas?" text="Elige una categoría y después el servicio que deseas reservar." />

      <div role="radiogroup" aria-label="Categoría de tratamiento" className="grid grid-cols-2 gap-3 md:gap-4">
        {available.map((c) => {
          const active = category === c.category;
          return (
            <button
              key={c.category}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onCategory(c.category)}
              className={cn(
                "group relative flex aspect-[4/3] flex-col justify-end overflow-hidden p-4 text-left text-background transition-shadow duration-500 md:aspect-[16/10] md:p-5",
                active ? "ring-2 ring-primary-dark ring-offset-4 ring-offset-background" : "",
              )}
            >
              <Image src={c.image.src} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-1000 ease-expo group-hover:scale-105" />
              <span className={cn("absolute inset-0 transition-colors duration-500", active ? "bg-primary-dark/55" : "bg-primary-dark/35 group-hover:bg-primary-dark/45")} aria-hidden />
              <span className="relative font-display text-xs italic opacity-80">{c.number}</span>
              <span className="relative mt-1 font-display text-[1.25rem] leading-tight md:text-[1.6rem]">{c.label}</span>
              {active && (
                <motion.span layoutId="cat-check" className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-background text-primary-dark">
                  <Check size={14} strokeWidth={2} />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {category && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mt-12">
          <p className="eyebrow text-muted">Servicios de {categoryByKey[category].label.toLowerCase()}</p>
          <ul role="radiogroup" aria-label="Servicio" className="mt-4 border-t hairline">
            {list.map((t) => {
              const active = treatment?.id === t.id;
              return (
                <li key={t.id} className="border-b hairline">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onTreatment(t)}
                    className="group flex w-full items-center gap-5 py-5 text-left"
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        active ? "border-primary-dark bg-primary-dark text-background" : "border-ink/30 group-hover:border-primary-dark",
                      )}
                      aria-hidden
                    >
                      {active && <Check size={11} strokeWidth={2.5} />}
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-[1.45rem] leading-tight">{t.name}</span>
                      {t.description && <span className="mt-1 block text-sm text-muted">{t.description}</span>}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted">
                      <Clock size={14} strokeWidth={1.4} aria-hidden /> {t.durationMinutes} min
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Paso 3: hora ──────────────────────────────────────────────────────── */

type SlotsState = { status: "loading" } | { status: "ready"; slots: TimeSlot[] } | { status: "error"; message: string };

export function StepTime({
  treatmentId,
  date,
  selected,
  onSelect,
  notice,
  refreshKey,
}: {
  treatmentId: string;
  date: string;
  selected: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
  notice?: string | null;
  refreshKey: number;
}) {
  const [reload, setReload] = useState(0);
  const requestKey = `${treatmentId}|${date}|${reload}|${refreshKey}`;
  const [result, setResult] = useState<({ key: string } & Exclude<SlotsState, { status: "loading" }>) | null>(null);
  const state: SlotsState = result && result.key === requestKey ? result : { status: "loading" };

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/availability?treatmentId=${encodeURIComponent(treatmentId)}&date=${date}`, { signal: ctrl.signal, cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "No pudimos consultar los horarios.");
        setResult({ key: requestKey, status: "ready", slots: body.slots ?? [] });
      })
      .catch((e: Error) => e.name !== "AbortError" && setResult({ key: requestKey, status: "error", message: e.message }));
    return () => ctrl.abort();
  }, [treatmentId, date, requestKey]);

  const groups =
    state.status === "ready"
      ? [
          { label: "Mañana", slots: state.slots.filter((s) => s.label < "12:00") },
          { label: "Tarde", slots: state.slots.filter((s) => s.label >= "12:00") },
        ].filter((g) => g.slots.length)
      : [];

  return (
    <div>
      <StepHeading eyebrow="Paso 3 de 5" title="Elige la hora" text={`Horarios disponibles para el ${formatDateKey(date)}.`} />

      {notice && (
        <p role="alert" className="mb-8 border-l-2 border-[#a24a3a] bg-[#a24a3a]/5 py-3 pl-4 pr-3 text-sm text-[#7d3a2e]">
          {notice}
        </p>
      )}

      {state.status === "loading" && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4" aria-busy="true" aria-label="Cargando horarios">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-14 animate-pulse rounded-full bg-surface" />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div role="alert" className="border hairline p-6 text-sm">
          <p>{state.message}</p>
          <button type="button" onClick={() => setReload((r) => r + 1)} className="mt-4 inline-flex items-center gap-2 font-semibold text-primary-dark">
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      )}

      {state.status === "ready" && !groups.length && (
        <p className="border-l-2 border-accent pl-4 text-ink/70">
          Este día ya no tiene horarios disponibles. Vuelve al calendario y elige otra fecha.
        </p>
      )}

      <div className="space-y-10">
        {groups.map((g) => (
          <fieldset key={g.label}>
            <legend className="eyebrow mb-4 text-muted">{g.label}</legend>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {g.slots.map((s) => {
                const active = selected?.startsAt === s.startsAt;
                return (
                  <motion.button
                    key={s.startsAt}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onSelect(s)}
                    aria-pressed={active}
                    className={cn(
                      "h-14 rounded-full border text-[0.95rem] tabular-nums transition-colors duration-300",
                      active ? "border-primary-dark bg-primary-dark text-background" : "border-ink/15 hover:border-primary-dark",
                    )}
                  >
                    {formatTime(new Date(s.startsAt))}
                  </motion.button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

/* ─── Paso 4: datos ─────────────────────────────────────────────────────── */

export function StepDetails({
  value,
  onSubmit,
  formId,
}: {
  value: CustomerDetails;
  onSubmit: (c: CustomerDetails) => void;
  formId: string;
}) {
  const [form, setForm] = useState(value);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof CustomerDetails>(key: K, v: CustomerDetails[K]) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (errors[key])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    onSubmit({ ...form, consent: true });
  };

  const field = (key: "fullName" | "email" | "whatsapp", label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`f-${key}`} className="eyebrow text-muted">
        {label}
      </label>
      <input
        id={`f-${key}`}
        className="field mt-1"
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `e-${key}` : undefined}
        {...props}
      />
      {errors[key] && (
        <p id={`e-${key}`} className="mt-2 text-xs text-[#a24a3a]">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form id={formId} onSubmit={submit} noValidate>
      <StepHeading eyebrow="Paso 4 de 5" title="Tus datos de contacto" text="Los usaremos únicamente para gestionar y confirmar tu cita." />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="md:col-span-2">{field("fullName", "Nombre completo", { autoComplete: "name", placeholder: "Nombre y apellidos" })}</div>
        {field("email", "Correo electrónico", { type: "email", autoComplete: "email", inputMode: "email", placeholder: "tu@correo.com" })}
        {field("whatsapp", "WhatsApp", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "+57 300 000 0000" })}
        <div className="md:col-span-2">
          <label htmlFor="f-message" className="eyebrow text-muted">
            Mensaje <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <textarea
            id="f-message"
            rows={3}
            maxLength={600}
            className="field mt-1 resize-none"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="¿Algo que debamos saber para organizar tu visita?"
            aria-describedby="h-message"
          />
          <p id="h-message" className="mt-2 text-xs text-muted">
            Por tu privacidad, no incluyas información médica en este mensaje. La revisaremos en tu valoración.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <label className="flex cursor-pointer items-start gap-4">
          <input
            id="f-consent"
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "e-consent" : undefined}
            className="mt-1 size-4 shrink-0 accent-[var(--primary-dark)]"
          />
          <span className="text-sm leading-relaxed text-ink/75">
            He leído y acepto la{" "}
            <Link href="/politica-de-privacidad" target="_blank" className="link-underline link-underline-static text-primary-dark">
              política de privacidad
            </Link>{" "}
            y autorizo el tratamiento de mis datos para gestionar mi cita.
          </span>
        </label>
        {errors.consent && (
          <p id="e-consent" className="mt-2 pl-8 text-xs text-[#a24a3a]">
            {errors.consent}
          </p>
        )}
      </div>
    </form>
  );
}

/* ─── Paso 5: resumen ───────────────────────────────────────────────────── */

export function StepSummary({ draft, onEdit, error }: { draft: BookingDraft; onEdit: (step: 0 | 1 | 2 | 3) => void; error: React.ReactNode }) {
  const { treatment, date, slot, customer } = draft;
  if (!treatment || !date || !slot) return null;
  const start = new Date(slot.startsAt);

  const rows: { label: string; value: string; step: 0 | 1 | 2 | 3 }[] = [
    { label: "Tratamiento", value: `${treatment.name} · ${categoryByKey[treatment.category].label}`, step: 0 },
    { label: "Fecha", value: formatLongDate(start), step: 1 },
    { label: "Hora", value: `${formatTime(start)} · ${treatment.durationMinutes} min aprox.`, step: 2 },
    { label: "Nombre", value: customer.fullName, step: 3 },
    { label: "Correo", value: customer.email, step: 3 },
    { label: "WhatsApp", value: customer.whatsapp, step: 3 },
  ];
  if (customer.message) rows.push({ label: "Mensaje", value: customer.message, step: 3 });

  return (
    <div>
      <StepHeading eyebrow="Paso 5 de 5" title="Revisa tu solicitud" text="Confirma que todo está correcto antes de enviarla." />
      {error}
      <dl className="border-t hairline">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[7rem_1fr_auto] items-baseline gap-4 border-b hairline py-5 sm:grid-cols-[10rem_1fr_auto]">
            <dt className="eyebrow text-muted">{r.label}</dt>
            <dd className="break-words text-[0.98rem] first-letter:uppercase">{r.value}</dd>
            <dd>
              <button type="button" onClick={() => onEdit(r.step)} className="link-underline text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Editar
              </button>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-sm leading-relaxed text-muted">
        Al enviar, tu solicitud quedará registrada como <strong className="font-semibold text-ink">pendiente de confirmación</strong>. El centro
        la revisará y te contactará para confirmarla. No se realiza ningún cobro en línea.
      </p>
    </div>
  );
}

/* ─── Confirmación ──────────────────────────────────────────────────────── */

export function StepConfirmation({ booking, whatsappPhone, onNew }: { booking: BookingConfirmation; whatsappPhone: string; onNew: () => void }) {
  const start = new Date(booking.startsAt);
  const event = {
    reference: booking.reference,
    title: `${booking.treatmentName} · Centro Estético Claudia Hernández`,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
  };

  return (
    <div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex size-16 items-center justify-center rounded-full bg-primary-dark text-background"
      >
        <Check size={26} strokeWidth={1.6} />
      </motion.div>

      <p className="eyebrow mt-10 text-primary">Solicitud registrada</p>
      <h2 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.05] text-primary-dark focus:outline-none" tabIndex={-1} data-step-title>
        Gracias, {booking.fullName.split(" ")[0]}.
      </h2>
      <p className="mt-5 max-w-lg text-[1rem] leading-relaxed text-ink/75">
        {booking.status === "PENDING" ? (
          <>
            Hemos guardado tu solicitud de cita. Está <strong className="font-semibold text-ink">pendiente de confirmación</strong>: el centro la
            revisará y te contactará por WhatsApp o correo para confirmarla.
          </>
        ) : (
          <>
            Tu solicitud de cita está registrada. Estado actual:{" "}
            <strong className="font-semibold text-ink">{bookingStatusLabel[booking.status].toLowerCase()}</strong>.
          </>
        )}
      </p>

      <div className="mt-10 border hairline bg-surface/60 p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b hairline pb-5">
          <span className="eyebrow text-muted">Referencia</span>
          <span className="font-display text-3xl tracking-wide text-primary-dark">{booking.reference}</span>
        </div>
        <dl className="mt-5 grid gap-4 text-[0.95rem] sm:grid-cols-2">
          <div>
            <dt className="eyebrow text-muted">Tratamiento</dt>
            <dd className="mt-1">{booking.treatmentName}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted">Estado</dt>
            <dd className="mt-1">{bookingStatusLabel[booking.status]}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted">Fecha</dt>
            <dd className="mt-1 first-letter:uppercase">{formatLongDate(start)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted">Hora</dt>
            <dd className="mt-1">{formatTime(start)}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs text-muted">
          {booking.emailSent
            ? `Te enviamos un resumen a ${booking.email}.`
            : "Guarda tu número de referencia. No se envió un correo de confirmación."}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={whatsappAfterBooking(booking.reference, whatsappPhone)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 rounded-full bg-primary-dark px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-primary"
        >
          <WhatsappIcon size={16} /> Escribir por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => downloadIcs(event)}
          className="inline-flex items-center justify-center gap-3 rounded-full border border-ink/20 px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-primary-dark"
        >
          <Download size={15} strokeWidth={1.5} /> Añadir al calendario
        </button>
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 rounded-full border border-ink/20 px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-primary-dark"
        >
          <CalendarPlus size={15} strokeWidth={1.5} /> Google Calendar
        </a>
      </div>

      <div className="mt-12 flex flex-wrap gap-8 border-t hairline pt-8 text-sm">
        <Link href="/" className="link-underline link-underline-static">Volver al inicio</Link>
        <button type="button" onClick={onNew} className="link-underline link-underline-static">
          Hacer otra solicitud
        </button>
      </div>
    </div>
  );
}

export function SubmitSpinner() {
  return <Loader2 size={16} className="animate-spin" aria-hidden />;
}
