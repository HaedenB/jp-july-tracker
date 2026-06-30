import { addDays, endOfMonth, format, parseISO, startOfMonth, differenceInCalendarDays } from "date-fns";

export function currentMonth(): string {
  return format(new Date(), "yyyy-MM");
}

export function monthLabel(month: string): string {
  return format(parseISO(`${month}-01`), "MMMM yyyy");
}

export function monthRange(month: string): { start: string; end: string; days: string[] } {
  const first = startOfMonth(parseISO(`${month}-01`));
  const last = endOfMonth(first);
  const days: string[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) {
    days.push(format(d, "yyyy-MM-dd"));
  }
  return { start: format(first, "yyyy-MM-dd"), end: format(last, "yyyy-MM-dd"), days };
}

export function daysRemainingInMonth(month: string, today: Date = new Date()): number {
  const last = endOfMonth(parseISO(`${month}-01`));
  const todayStr = format(today, "yyyy-MM-dd");
  const todayInMonth = parseISO(todayStr);
  if (todayInMonth > last) return 0;
  const first = startOfMonth(parseISO(`${month}-01`));
  const from = todayInMonth < first ? first : todayInMonth;
  return differenceInCalendarDays(last, from) + 1;
}

export function shiftMonth(month: string, delta: number): string {
  const d = parseISO(`${month}-01`);
  d.setMonth(d.getMonth() + delta);
  return format(d, "yyyy-MM");
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}
