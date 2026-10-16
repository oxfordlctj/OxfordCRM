const TZ = "Asia/Dushanbe";

/** Сегодняшняя дата в Душанбе в формате YYYY-MM-DD */
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function addDaysISO(days: number, from = todayISO()) {
  const d = new Date(`${from}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value.length === 10 ? `${value}T00:00:00Z` : value) : value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: typeof value === "string" && value.length === 10 ? "UTC" : TZ,
  }).format(d);
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(value);
}

export function isOverdue(due: string | null) {
  return !!due && due < todayISO();
}
