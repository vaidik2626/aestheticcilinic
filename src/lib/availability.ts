/**
 * Cálculo puro de franjas disponibles (sin acceso a base de datos), para que
 * el mismo algoritmo se use al listar horarios y al validar una reserva.
 */
import {
  addDaysKey,
  bogotaDateTime,
  minutesToTime,
  timeToMinutes,
  todayKey,
  weekdayOf,
} from "@/lib/time";
import type { TimeSlot } from "@/types/booking";

export interface WorkingRange {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface BookingRules {
  slotIntervalMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
}

export interface Interval {
  start: Date;
  end: Date;
}

export interface DaySlotsInput {
  date: string;
  durationMinutes: number;
  ranges: WorkingRange[];
  rules: BookingRules;
  /** Citas activas: [startsAt, blockedUntil). */
  bookings: Interval[];
  /** Bloqueos del centro: [startsAt, endsAt). */
  timeOff: Interval[];
  now?: Date;
}

const overlaps = (aStart: number, aEnd: number, b: Interval) => aStart < b.end.getTime() && b.start.getTime() < aEnd;

export function isDateInWindow(date: string, rules: BookingRules, now = new Date()) {
  const today = todayKey(now);
  return date >= today && date <= addDaysKey(today, rules.maxAdvanceDays);
}

export function computeDaySlots({
  date,
  durationMinutes,
  ranges,
  rules,
  bookings,
  timeOff,
  now = new Date(),
}: DaySlotsInput): TimeSlot[] {
  if (!isDateInWindow(date, rules, now)) return [];

  const weekday = weekdayOf(date);
  const earliest = now.getTime() + rules.minNoticeHours * 3_600_000;
  const durationMs = durationMinutes * 60_000;
  const bufferMs = rules.bufferMinutes * 60_000;
  const step = Math.max(5, rules.slotIntervalMinutes);
  const seen = new Set<string>();
  const slots: TimeSlot[] = [];

  for (const range of ranges.filter((r) => r.weekday === weekday)) {
    const open = timeToMinutes(range.startTime);
    const close = timeToMinutes(range.endTime);
    for (let t = open; t + durationMinutes <= close; t += step) {
      const label = minutesToTime(t);
      if (seen.has(label)) continue;
      const start = bogotaDateTime(date, label).getTime();
      if (start < earliest) continue;
      const end = start + durationMs;
      const blockedUntil = end + bufferMs;
      if (bookings.some((b) => overlaps(start, blockedUntil, b))) continue;
      if (timeOff.some((b) => overlaps(start, end, b))) continue;
      seen.add(label);
      slots.push({ startsAt: new Date(start).toISOString(), label });
    }
  }

  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
