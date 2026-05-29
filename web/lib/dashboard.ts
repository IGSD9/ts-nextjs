import type { DailyReport } from "@prisma/client";
import {
  CHECKIN_CODES,
  CHECKIN_EMOJIS,
  type CheckinField,
} from "@/lib/checkin-codes";
import {
  OTHER_NOTES_PERIOD_OPTIONS,
  type OtherNotesPeriod,
} from "@/lib/other-note";
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

export type DashboardPeriodContext = {
  period: OtherNotesPeriod;
  periodLabel: string;
  periodRangeLabel: string;
  rangeStart: Date;
  rangeEnd: Date;
  dayKeys: string[];
};

function dateToKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDayKeysBetween(start: Date, end: Date): string[] {
  const keys: string[] = [];
  let cursor = start;
  while (cursor.getTime() <= end.getTime()) {
    keys.push(dateToKey(cursor));
    cursor = addDaysUtc(cursor, 1);
  }
  return keys;
}

/** Step 09: Asia/Tokyo で直近7日（今日含む）の YYYY-MM-DD 配列（古い→新しい） */
export function getLast7DayKeys(): string[] {
  const { dayKeys } = getDashboardPeriodContext("7d", null);
  return dayKeys;
}

export function getDashboardDateRange(): { weekStart: Date; todayDate: Date } {
  const { rangeStart, rangeEnd } = getDashboardPeriodContext("7d", null);
  return { weekStart: rangeStart, todayDate: rangeEnd };
}

export function getDashboardPeriodContext(
  period: OtherNotesPeriod,
  earliestReportDate: Date | null,
): DashboardPeriodContext {
  const todayTokyo = tokyoDateString();
  const rangeEnd = parseDateOnlyUtc(todayTokyo);

  let rangeStart: Date;
  if (period === "all") {
    rangeStart = earliestReportDate ?? rangeEnd;
  } else {
    const daysInclusive =
      period === "7d" ? 7 : period === "14d" ? 14 : 30;
    rangeStart = addDaysUtc(rangeEnd, -(daysInclusive - 1));
  }

  const dayKeys = getDayKeysBetween(rangeStart, rangeEnd);
  const periodLabel =
    OTHER_NOTES_PERIOD_OPTIONS.find((option) => option.value === period)?.label ??
    "直近7日";

  return {
    period,
    periodLabel,
    periodRangeLabel:
      period === "all" && !earliestReportDate
        ? todayTokyo
        : `${dateToKey(rangeStart)} 〜 ${todayTokyo}`,
    rangeStart,
    rangeEnd,
    dayKeys,
  };
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
