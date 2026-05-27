/**
 * Step 08: ピザメーター（0–100）
 * - 参加率: 当日（Asia/Tokyo）に DailyReport がある人数 / 登録ユーザー数
 * - 元気スコア: 直近7日（同日含む7日分）の全レポートについて (6 - fog) の平均を 0–100 に正規化
 *   fog は 1–3 なので (6 - fog) は 3–5。平均の理論下限3・上限5を 0–100 に線形マップする。
 * 最終ゲージは参加率50% + 元気50% の加重（設計書の「など」に合わせたMVP固定式）。
 */

export function tokyoDateString(d = new Date()): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
}

export function parseDateOnlyUtc(yyyyMmDd: string): Date {
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}

export function addDaysUtc(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** (6 - fog) 平均を 3..5 のレンジで 0..1 に正規化 */
export function vitality01FromAvgSixMinusFog(avg: number | null): number {
  if (avg === null || Number.isNaN(avg)) return 0;
  return clamp01((avg - 3) / (5 - 3));
}

export function pizzaGaugePercent(participation01: number, vitality01: number): number {
  const combined = 0.5 * participation01 + 0.5 * vitality01;
  return Math.round(combined * 100);
}
