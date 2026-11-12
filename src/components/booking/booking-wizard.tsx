"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookingCalendar } from "@/components/booking/calendar";
import { StepConfirmation, StepDetails, StepHeading, StepService, StepSummary, StepTime, SubmitSpinner } from "@/components/booking/steps";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { categoryByKey } from "@/data/treatments";
import { BOOKING_STEPS, useBooking, type StepIndex } from "@/hooks/use-booking";
import { useLenis } from "@/hooks/use-lenis";
import { formatLongDate, formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";
import type { BookingDraft, CreateBookingResult } from "@/types/booking";
import type { PublicTreatment, TreatmentCategory } from "@/types/treatment";

const DETAILS_FORM = "booking-details";
const ease = [0.16, 1, 0.3, 1] as const;

function fallbackMessage(d: BookingDraft) {
  const parts = ["Hola, quisiera reservar una cita"];
  if (d.treatment) parts.push(`para ${d.treatment.name}`);
  if (d.slot) parts.push(`el ${formatLongDate(new Date(d.slot.startsAt))} a las ${formatTime(new Date(d.slot.startsAt))}`);
  return `${parts.join(" ")}.`;
}

interface WizardProps {
  treatments: PublicTreatment[];
  whatsappPhone: string;
  initialCategory: TreatmentCategory | null;
  initialTreatmentId: string | null;
}

export function BookingWizard({ treatments, whatsappPhone, initialCategory, initialTreatmentId }: WizardProps) {
  const initialTreatment = treatments.find((t) => t.id === initialTreatmentId) ?? null;
  const { state, dispatch, canEnter } = useBooking({ category: initialCategory, treatment: initialTreatment });
  const { step, direction, draft, confirmation, idempotencyKey } = state;
  const lenis = useLenis();
  const top = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);
  const [slotRefresh, setSlotRefresh] = useState(0);
  const prevStep = useRef(step);

  // Llevar el foco y el scroll al inicio del paso en cada cambio (no en la carga inicial).
  useEffect(() => {
    if (prevStep.current === step) return;
    prevStep.current = step;
    const y = (top.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 100;
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: "smooth" });
    const id = window.setTimeout(() => document.querySelector<HTMLElement>("[data-step-title]")?.focus({ preventScroll: true }), 450);
    return () => window.clearTimeout(id);
  }, [step, lenis]);

  const goto = useCallback((s: StepIndex) => {
    setError(null);
    dispatch({ type: "goto", step: s });
  }, [dispatch]);

  const onCalendarError = useCallback((message: string) => setError(message), []);

  const submit = async () => {
    if (submitting || !draft.treatment || !draft.slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          treatmentId: draft.treatment.id,
          startsAt: draft.slot.startsAt,
          ...draft.customer,
          idempotencyKey,
          website: honeypot.current?.value ?? "",
        }),
      });
      const result = (await res.json().catch(() => null)) as CreateBookingResult | null;
      if (!result) throw new Error("network");
      if (result.ok) {
        dispatch({ type: "confirmed", booking: result.booking });
        return;
      }
      if (result.code === "SLOT_TAKEN") {
        dispatch({ type: "slot", slot: null });
        setSlotNotice(result.message);
        setSlotRefresh((n) => n + 1);
        dispatch({ type: "goto", step: 2 });
        return;
      }
      if (result.code === "VALIDATION" && result.fieldErrors && Object.keys(result.fieldErrors).some((k) => ["fullName", "email", "whatsapp", "message", "consent"].includes(k))) {
        setError(Object.values(result.fieldErrors)[0]);
        dispatch({ type: "goto", step: 3 });
        return;
      }
      setError(result.message);
    } catch {
      setError("No pudimos conectar con el servicio de reservas. Tu cita no ha sido guardada. Inténtalo de nuevo o escríbenos por WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 3) return; // el formulario de datos envía con su propio submit
    if (step === 4) return void submit();
    const target = (step + 1) as StepIndex;
    if (canEnter(target)) goto(target);
  };

  const errorBox = error && (
    <div role="alert" className="mb-8 border border-[#a24a3a]/30 bg-[#a24a3a]/5 p-5 text-sm text-[#7d3a2e]">
      <p>{error}</p>
      <a
        href={whatsappUrl(fallbackMessage(draft), whatsappPhone)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 font-semibold text-primary-dark"
      >
        <WhatsappIcon size={15} /> Reservar por WhatsApp
      </a>
    </div>
  );

  if (step === 5 && confirmation) {
    return (
      <div ref={top} className="mx-auto max-w-3xl">
        <StepConfirmation booking={confirmation} whatsappPhone={whatsappPhone} onNew={() => dispatch({ type: "reset" })} />
      </div>
    );
  }

  const nextDisabled =
    submitting || (step < 3 && !canEnter((step + 1) as StepIndex));
  const nextLabel = step === 4 ? (submitting ? "Enviando…" : "Enviar solicitud") : "Continuar";

  return (
    <div ref={top} className="grid grid-cols-12 gap-x-6 gap-y-10">
      {/* Progreso + resumen */}
      <aside className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <ol className="flex gap-2 lg:flex-col lg:gap-0" aria-label="Progreso de la reserva">
            {BOOKING_STEPS.map((label, i) => {
              const done = i < step;
              const current = i === step;
              const reachable = i < step || canEnter(i as StepIndex);
              return (
                <li key={label} className="relative flex-1 lg:flex-none">
                  <button
                    type="button"
                    disabled={!reachable || i > step || submitting}
                    onClick={() => goto(i as StepIndex)}
                    aria-current={current ? "step" : undefined}
                    className="group flex w-full flex-col gap-2 text-left lg:flex-row lg:items-center lg:gap-4 lg:py-3"
                  >
                    <span className="relative hidden size-8 shrink-0 items-center justify-center rounded-full border border-ink/20 text-xs lg:flex">
                      {current && <motion.span layoutId="step-dot" className="absolute inset-0 rounded-full bg-primary-dark" transition={{ duration: 0.5, ease }} />}
                      <span className={cn("relative", current && "text-background", done && "text-primary")}>
                        {done ? <Check size={13} strokeWidth={2} /> : i + 1}
                      </span>
                    </span>
                    <span className="relative block h-[2px] w-full overflow-hidden bg-ink/10 lg:hidden">
                      <motion.span
                        className="absolute inset-0 origin-left bg-primary-dark"
                        initial={false}
                        animate={{ scaleX: done || current ? 1 : 0 }}
                        transition={{ duration: 0.6, ease }}
                      />
                    </span>
                    <span
                      className={cn(
                        "text-[0.65rem] font-semibold uppercase tracking-[0.14em] lg:text-[0.8rem] lg:font-medium lg:normal-case lg:tracking-normal",
                        current ? "text-primary-dark" : "text-muted",
                        !current && "max-lg:hidden max-lg:sm:block",
                      )}
                    >
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {draft.treatment && (
            <motion.div layout className="mt-10 hidden border-t hairline pt-6 text-sm lg:block">
              <p className="eyebrow text-muted">Tu selección</p>
              <p className="mt-3 font-display text-2xl leading-tight">{draft.treatment.name}</p>
              <p className="mt-1 text-muted">{categoryByKey[draft.treatment.category].label} · {draft.treatment.durationMinutes} min</p>
              {draft.date && (
                <p className="mt-4 first-letter:uppercase">
                  {formatLongDate(new Date(`${draft.date}T12:00:00-05:00`))}
                  {draft.slot && ` · ${formatTime(new Date(draft.slot.startsAt))}`}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </aside>

      {/* Paso actual */}
      <div className="col-span-12 lg:col-span-7 lg:col-start-6">
        <div className="relative min-h-[28rem]">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.5, ease }}
            >
              {step !== 4 && errorBox}

              {step === 0 && (
                <StepService
                  treatments={treatments}
                  category={draft.category}
                  treatment={draft.treatment}
                  onCategory={(category) => dispatch({ type: "category", category })}
                  onTreatment={(treatment) => dispatch({ type: "treatment", treatment })}
                />
              )}

              {step === 1 && draft.treatment && (
                <div>
                  <StepHeading eyebrow="Paso 2 de 5" title="Elige el día" text="Solo se muestran las fechas con horarios disponibles." />
                  <BookingCalendar
                    treatmentId={draft.treatment.id}
                    selected={draft.date}
                    onSelect={(date) => {
                      dispatch({ type: "date", date });
                      setSlotNotice(null);
                    }}
                    onError={onCalendarError}
                  />
                </div>
              )}

              {step === 2 && draft.treatment && draft.date && (
                <StepTime
                  treatmentId={draft.treatment.id}
                  date={draft.date}
                  selected={draft.slot}
                  notice={slotNotice}
                  refreshKey={slotRefresh}
                  onSelect={(slot) => {
                    dispatch({ type: "slot", slot });
                    setSlotNotice(null);
                  }}
                />
              )}

              {step === 3 && (
                <StepDetails
                  formId={DETAILS_FORM}
                  value={draft.customer}
                  onSubmit={(customer) => {
                    dispatch({ type: "customer", customer });
                    goto(4);
                  }}
                />
              )}

              {step === 4 && <StepSummary draft={draft} onEdit={(s) => goto(s)} error={errorBox} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Campo trampa anti-spam (oculto para personas) */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Sitio web
            <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {/* Navegación */}
        <div className="sticky bottom-0 z-10 -mx-[var(--gutter)] mt-12 flex items-center justify-between gap-4 border-t hairline bg-background/95 px-[var(--gutter)] py-4 backdrop-blur md:static md:mx-0 md:bg-transparent md:px-0 md:pt-8 md:backdrop-blur-none">
          <button
            type="button"
            onClick={() => goto((step - 1) as StepIndex)}
            disabled={step === 0 || submitting}
            className="inline-flex items-center gap-2 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-ink disabled:invisible"
          >
            <ArrowLeft size={15} strokeWidth={1.5} /> Atrás
          </button>
          <motion.button
            type={step === 3 ? "submit" : "button"}
            form={step === 3 ? DETAILS_FORM : undefined}
            onClick={step === 3 ? undefined : next}
            disabled={nextDisabled}
            whileTap={{ scale: 0.97 }}
            aria-busy={submitting}
            className="inline-flex items-center gap-3 rounded-full bg-primary-dark px-7 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-background transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nextLabel}
            {submitting ? <SubmitSpinner /> : <ArrowRight size={15} strokeWidth={1.5} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
