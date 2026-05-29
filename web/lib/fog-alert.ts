import type { DailyReport, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Step 11 / BR-01（詳細設計で固定）
 * - 濃霧 = fog コード 3（CHECKIN_CODES.fog の3番目）
 * - 各ユーザのチェックイン日のみを日付降順に並べ、直近から遡って fog===3 が
 *   5回連続したらアラート（欠席日はカウントに含めない）
 * - DailyReport.otherNote（その他）は参照しない
 */
export const FOG_HEAVY_CODE = 3;
export const FOG_ALERT_CONSECUTIVE_CHECKINS = 5;

export type FogReportSlice = Pick<DailyReport, "reportDate" | "fog">;

export type FogAlertUser = {
  id: string;
  name: string;
  email: string;
  consecutiveHeavyFogDays: number;
  latestReportDate: string;
};

export function isFogAlertFromReports(reports: FogReportSlice[]): boolean {
  return countConsecutiveHeavyFogFromRecent(reports) >= FOG_ALERT_CONSECUTIVE_CHECKINS;
}

/** 直近のチェックイン日から遡り、連続する濃霧（fog===3）の日数 */
export function countConsecutiveHeavyFogFromRecent(reports: FogReportSlice[]): number {
  if (reports.length === 0) return 0;

  const sorted = [...reports].sort(
    (a, b) => b.reportDate.getTime() - a.reportDate.getTime(),
  );

  let streak = 0;
  for (const report of sorted) {
    if (report.fog === FOG_HEAVY_CODE) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function reportDateKey(reportDate: Date): string {
  const y = reportDate.getUTCFullYear();
  const m = `${reportDate.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${reportDate.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toFogAlertUser(
  user: Pick<User, "id" | "name" | "email">,
  reports: FogReportSlice[],
): FogAlertUser {
  const sorted = [...reports].sort(
    (a, b) => b.reportDate.getTime() - a.reportDate.getTime(),
  );
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    consecutiveHeavyFogDays: countConsecutiveHeavyFogFromRecent(reports),
    latestReportDate: sorted[0] ? reportDateKey(sorted[0].reportDate) : "",
  };
}

/** 全ユーザーを走査し、FOG アラート対象のみ返す（管理者向け） */
export async function getFogAlertUsers(): Promise<FogAlertUser[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      reports: {
        select: { reportDate: true, fog: true },
        orderBy: { reportDate: "desc" },
      },
    },
  });

  return users
    .filter((user) => isFogAlertFromReports(user.reports))
    .map((user) => toFogAlertUser(user, user.reports));
}
