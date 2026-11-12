/**
 * Utilidades de fecha y hora para Bogotá.
 * Colombia usa UTC−05:00 todo el año (sin horario de verano desde 1993),
 * por lo que el desfase fijo es exacto y evita dependencias pesadas.
 */
export const BOGOTA_TZ = "America/Bogota";
/** Índice = weekday (0 = domingo), igual que AvailabilityRule.weekday. */
export const WEEKDAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const OFFSET_MINUTES = -5 * 60;
const OFFSET_ISO = "-05:00";

/** "YYYY-MM-DD" + "HH:MM" en hora de Bogotá → Date (instante UTC). */
export function bogotaDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${OFFSET_ISO}`);
}

/** Inicio del día (00:00 Bogotá) para una fecha "YYYY-MM-DD". */
export function bogotaStartOfDay(date: string): Date {
  return bogotaDateTime(date, "00:00");
}

/** Date → "YYYY-MM-DD" en hora de Bogotá. */
export function toBogotaDateKey(d: Date): string {
  const local = new Date(d.getTime() + OFFSET_MINUTES * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Date → "HH:MM" en hora de Bogotá. */
export function toBogotaTime(d: Date): string {
  const local = new Date(d.getTime() + OFFSET_MINUTES * 60_000);
  return local.toISOString().slice(11, 16);
}

/** Día de la semana (0 = domingo) de una fecha "YYYY-MM-DD". */
export function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function addDaysKey(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayKey(now = new Date()): string {
  return toBogotaDateKey(now);
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function daysInMonth(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  timeZone: BOGOTA_TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("es-CO", {
  timeZone: BOGOTA_TZ,
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("es-CO", {
  timeZone: BOGOTA_TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export const formatLongDate = (d: Date) => dateFormatter.format(d);
export const formatShortDate = (d: Date) => shortDateFormatter.format(d);
export const formatTime = (d: Date) => timeFormatter.format(d).replace(/\s/g, " ");

export function formatDateKey(date: string) {
  return formatLongDate(bogotaDateTime(date, "12:00"));
}
