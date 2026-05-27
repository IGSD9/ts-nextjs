import { prisma } from "@/lib/prisma";
import {
  addDaysUtc,
  clamp01,
  parseDateOnlyUtc,
  pizzaGaugePercent,
  tokyoDateString,
  vitality01FromAvgSixMinusFog,
} from "@/lib/pizza-meter";

/**
 * Step 12: 管理者コンソール用チームサマリー
 * - 参加率: 当日 / 直近7日（Tokyo）に1件以上レポートがあるユーザー数 ÷ 登録ユーザー数
 * - 元気度: 直近7日の全レポートについて (6 - fog) の平均（完了画面・ピザメーターと同式）
 */
export type AdminTeamSummary = {
  userCount: number;
  todayParticipantCount: number;
  todayParticipationPercent: number;
  weekParticipantCount: number;
  weekParticipationPercent: number;
  avgVitalityScore: number | null;
  teamGaugePercent: number;
  periodLabel: string;
};

export async function getAdminTeamSummary(): Promise<AdminTeamSummary> {
  const todayTokyo = tokyoDateString();
  const todayDate = parseDateOnlyUtc(todayTokyo);
  const weekStart = addDaysUtc(todayDate, -6);

  const [userCount, todayGroups, weekGroups, vitalityAgg] = await Promise.all([
    prisma.user.count(),
    prisma.dailyReport.groupBy({
      by: ["userId"],
      where: { reportDate: todayDate },
    }),
    prisma.dailyReport.groupBy({
      by: ["userId"],
      where: { reportDate: { gte: weekStart, lte: todayDate } },
    }),
    prisma.dailyReport.aggregate({
      where: { reportDate: { gte: weekStart, lte: todayDate } },
      _avg: { fog: true },
    }),
  ]);

  const todayParticipantCount = todayGroups.length;
  const weekParticipantCount = weekGroups.length;

  const todayParticipation01 =
    userCount === 0 ? 0 : clamp01(todayParticipantCount / userCount);
  const weekParticipation01 =
    userCount === 0 ? 0 : clamp01(weekParticipantCount / userCount);

  const avgFog = vitalityAgg._avg.fog;
  const avgVitality =
    avgFog === null || avgFog === undefined ? null : 6 - avgFog;
  const vitality01 = vitality01FromAvgSixMinusFog(avgVitality);
  const teamGaugePercent = pizzaGaugePercent(weekParticipation01, vitality01);

  return {
    userCount,
    todayParticipantCount,
    todayParticipationPercent: Math.round(todayParticipation01 * 100),
    weekParticipantCount,
    weekParticipationPercent: Math.round(weekParticipation01 * 100),
    avgVitalityScore: avgVitality,
    teamGaugePercent,
    periodLabel: `${reportDateKey(weekStart)} 〜 ${todayTokyo}`,
  };
}

function reportDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${date.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
