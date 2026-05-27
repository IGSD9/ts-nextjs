import type { DailyReport } from "@prisma/client";
import {
  CHECKIN_CODES,
  CHECKIN_EMOJIS,
  type CheckinField,
} from "@/lib/checkin-codes";
import {
  addDaysUtc,
  parseDateOnlyUtc,
  tokyoDateString,
} from "@/lib/pizza-meter";

export type DashboardDay = {
  dateKey: string;
  dateLabel: string;
  hasReport: boolean;
  fogEmoji: string | null;
  moodEmoji: string | null;
};

/** Step 09: Asia/Tokyo で直近7日（今日含む）の YYYY-MM-DD 配列（古い→新しい） */
export function getLast7DayKeys(): string[] {
  const todayTokyo = tokyoDateString();
  const todayDate = parseDateOnlyUtc(todayTokyo);
  const keys: string[] = [];
  for (let offset = -6; offset <= 0; offset += 1) {
    const d = addDaysUtc(todayDate, offset);
    const y = d.getUTCFullYear();
    const m = `${d.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${d.getUTCDate()}`.padStart(2, "0");
    keys.push(`${y}-${m}-${day}`);
  }
  return keys;
}

export function getDashboardDateRange(): { weekStart: Date; todayDate: Date } {
  const todayTokyo = tokyoDateString();
  const todayDate = parseDateOnlyUtc(todayTokyo);
  const weekStart = addDaysUtc(todayDate, -6);
  return { weekStart, todayDate };
}

function formatDateLabel(dateKey: string): string {
  const d = parseDateOnlyUtc(dateKey);
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getUTCDay()];
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return `${m}/${day}(${weekday})`;
}

function reportDateKey(reportDate: Date): string {
  const y = reportDate.getUTCFullYear();
  const m = `${reportDate.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${reportDate.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function emojiForField(field: CheckinField, code: number): string | null {
  const codes = CHECKIN_CODES[field] as readonly number[];
  const index = codes.indexOf(code);
  if (index < 0) return null;
  return CHECKIN_EMOJIS[field][index] ?? null;
}

export function buildDashboardDays(
  reports: Pick<DailyReport, "reportDate" | "fog" | "mood">[],
  dayKeys: string[],
): DashboardDay[] {
  const byDate = new Map<string, Pick<DailyReport, "reportDate" | "fog" | "mood">>();
  for (const report of reports) {
    byDate.set(reportDateKey(report.reportDate), report);
  }

  return dayKeys.map((dateKey) => {
    const report = byDate.get(dateKey);
    if (!report) {
      return {
        dateKey,
        dateLabel: formatDateLabel(dateKey),
        hasReport: false,
        fogEmoji: null,
        moodEmoji: null,
      };
    }
    return {
      dateKey,
      dateLabel: formatDateLabel(dateKey),
      hasReport: true,
      fogEmoji: emojiForField("fog", report.fog),
      moodEmoji: emojiForField("mood", report.mood),
    };
  });
}
