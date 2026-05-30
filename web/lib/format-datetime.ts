const TOKYO = "Asia/Tokyo";

export function formatTokyoDateTime(value: Date | null | undefined): string {
  if (!value) return "—";
  return value.toLocaleString("ja-JP", {
    timeZone: TOKYO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTokyoDate(value: Date | null | undefined): string {
  if (!value) return "—";
  return value.toLocaleDateString("ja-JP", {
    timeZone: TOKYO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function isSameTokyoDate(
  value: Date | null | undefined,
  tokyoYyyyMmDd: string,
): boolean {
  if (!value) return false;
  const dateKey = value.toLocaleDateString("en-CA", { timeZone: TOKYO });
  return dateKey === tokyoYyyyMmDd;
}
