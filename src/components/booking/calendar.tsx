"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { daysInMonth, todayKey, weekdayOf } from "@/lib/time";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKDAY_NAMES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const MONTH_LIMIT = 6;

const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 15)));
};

const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
};

interface CalendarProps {
  treatmentId: string;
  selected: string | null;
  onSelect: (date: string) => void;
  onError: (message: string) => void;
}

type MonthState = { status: "loading" } | { status: "ready"; dates: Set<string> } | { status: "error"; message: string };
type Keyed = { key: string } & Exclude<MonthState, { status: "loading" }>;

export function BookingCalendar({ treatmentId, selected, onSelect, onError }: CalendarProps) {
  const today = todayKey();
  const firstMonth = today.slice(0, 7);
  const [month, setMonth] = useState(selected?.slice(0, 7) ?? firstMonth);
  const [direction, setDirection] = useState(1);
  const requestKey = `${treatmentId}|${month}`;
  const [result, setResult] = useState<Keyed | null>(null);
  // Mientras la respuesta no corresponda al mes visible, se considera "cargando".
  const state: MonthState = result && result.key === requestKey ? result : { status: "loading" };

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/availability?treatmentId=${encodeURIComponent(treatmentId)}&month=${month}`, { signal: ctrl.signal, cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "No pudimos consultar la disponibilidad.");
        setResult({ key: requestKey, status: "ready", dates: new Set<string>(body.dates ?? []) });
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        setResult({ key: requestKey, status: "error", message: e.message });
        onError(e.message);
      });
    return () => ctrl.abort();
  }, [treatmentId, month, requestKey, onError]);

  const cells = useMemo(() => {
    const days = daysInMonth(month);
    const offset = (weekdayOf(days[0]) + 6) % 7; // lunes = 0
    return [...Array<null>(offset).fill(null), ...days];
  }, [month]);

  const lastMonth = shiftMonth(firstMonth, MONTH_LIMIT - 1);
  const go = (delta: 1 | -1) => {
    setDirection(delta);
    setMonth((m) => shiftMonth(m, delta));
  };

  const availableCount = state.status === "ready" ? state.dates.size : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="font-display text-3xl first-letter:uppercase" aria-live="polite">
          {monthLabel(month)}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={month <= firstMonth}
            aria-label="Mes anterior"
            className="flex size-11 items-center justify-center rounded-full border hairline transition-colors hover:border-primary-dark disabled:opacity-30"
          >
            <ChevronLeft size={17} strokeWidth={1.4} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={month >= lastMonth}
            aria-label="Mes siguiente"
            className="flex size-11 items-center justify-center rounded-full border hairline transition-colors hover:border-primary-dark disabled:opacity-30"
          >
            <ChevronRight size={17} strokeWidth={1.4} />
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-7 text-center" aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d} className="eyebrow pb-3 text-muted">{d}</span>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={month}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-7 gap-1"
            role="group"
            aria-label={`Días de ${monthLabel(month)}`}
            aria-busy={state.status === "loading"}
          >
            {cells.map((date, i) => {
              if (!date) return <span key={`e${i}`} />;
              const day = Number(date.slice(8));
              const past = date < today;
              const available = state.status === "ready" && state.dates.has(date);
              const isSelected = selected === date;
              const isToday = date === today;
              const weekdayName = WEEKDAY_NAMES[(weekdayOf(date) + 6) % 7];
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!available}
                  onClick={() => onSelect(date)}
                  aria-pressed={isSelected}
                  aria-label={`${weekdayName} ${day}${available ? ", disponible" : past ? ", fecha pasada" : ", sin disponibilidad"}`}
                  className={cn(
                    "relative mx-auto flex aspect-square w-full max-w-14 items-center justify-center rounded-full text-[0.95rem] transition-all duration-300",
                    state.status === "loading" && !past && "animate-pulse",
                    past && "text-ink/20",
                    !past && !available && "text-ink/30",
                    available && !isSelected && "font-medium text-ink hover:bg-surface-dark",
                    isSelected && "bg-primary-dark font-medium text-background",
                  )}
                >
                  {day}
                  {available && !isSelected && <span className="absolute bottom-[18%] size-1 rounded-full bg-accent" aria-hidden />}
                  {isToday && !isSelected && <span className="absolute inset-1 rounded-full border border-ink/15" aria-hidden />}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden /> Fechas con disponibilidad
        </span>
        <span>Hora de Bogotá (GMT−5)</span>
      </div>

      {state.status === "ready" && availableCount === 0 && (
        <p className="mt-6 border-l-2 border-accent pl-4 text-sm text-ink/70">
          No hay horarios disponibles en este mes. Prueba con el mes siguiente.
        </p>
      )}
    </div>
  );
}
