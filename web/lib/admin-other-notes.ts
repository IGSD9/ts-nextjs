import { prisma } from "@/lib/prisma";
import {
  addDaysUtc,
  parseDateOnlyUtc,
  tokyoDateString,
} from "@/lib/pizza-meter";

export const OTHER_NOTE_MAX_LENGTH = 500;

export const OTHER_NOTES_PERIODS = ["7d", "14d", "30d", "all"] as const;
export type OtherNotesPeriod = (typeof OTHER_NOTES_PERIODS)[number];

export const OTHER_NOTES_PERIOD_OPTIONS: {
  value: OtherNotesPeriod;
  label: string;
}[] = [
  { value: "7d", label: "直近7日" },
  { value: "14d", label: "直近14日" },
  { value: "30d", label: "直近1ヶ月（30日）" },
  { value: "all", label: "すべて表示" },
];

export type AdminOtherNoteEntry = {
  id: string;
  reportDate: string;
  userName: string;
  userEmail: string;
  otherNote: string;
};

export type AdminOtherNotesResult = {
  entries: AdminOtherNoteEntry[];
  period: OtherNotesPeriod;
  periodLabel: string;
  periodRangeLabel: string;
};

function reportDateKey(reportDate: Date): string {
  const y = reportDate.getUTCFullYear();
  const m = `${reportDate.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${reportDate.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseOtherNotesPeriod(value: string | undefined): OtherNotesPeriod {
  if (value && OTHER_NOTES_PERIODS.includes(value as OtherNotesPeriod)) {
    return value as OtherNotesPeriod;
  }
  return "7d";
}

function getPeriodRange(period: OtherNotesPeriod): {
  start: Date;
  end: Date;
  rangeLabel: string;
} | null {
  const todayTokyo = tokyoDateString();
  const end = parseDateOnlyUtc(todayTokyo);

  if (period === "all") {
    return null;
  }

  const daysInclusive =
    period === "7d" ? 7 : period === "14d" ? 14 : 30;
  const start = addDaysUtc(end, -(daysInclusive - 1));

  return {
    start,
    end,
    rangeLabel: `${reportDateKey(start)} 〜 ${todayTokyo}`,
  };
}

/** 「その他」記入一覧（FOG アラートとは無関係） */
export async function getAdminOtherNotes(
  period: OtherNotesPeriod = "7d",
): Promise<AdminOtherNotesResult> {
  const range = getPeriodRange(period);
  const periodLabel =
    OTHER_NOTES_PERIOD_OPTIONS.find((option) => option.value === period)?.label ??
    "直近7日";

  const reports = await prisma.dailyReport.findMany({
    where: {
      otherNote: { not: null },
      ...(range
        ? { reportDate: { gte: range.start, lte: range.end } }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
  });

  const entries = reports
    .map((report) => {
      const trimmed = report.otherNote?.trim() ?? "";
      if (!trimmed) return null;
      return {
        id: report.id,
        reportDate: reportDateKey(report.reportDate),
        userName: report.user.name,
        userEmail: report.user.email,
        otherNote: trimmed,
      };
    })
    .filter((entry): entry is AdminOtherNoteEntry => entry !== null);

  return {
    entries,
    period,
    periodLabel,
    periodRangeLabel: range?.rangeLabel ?? "全期間",
  };
}

export function parseOtherNoteFromForm(
  value: FormDataEntryValue | null,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, OTHER_NOTE_MAX_LENGTH);
}
