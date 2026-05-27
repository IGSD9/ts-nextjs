import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";
import { buildDashboardAdvice } from "@/lib/dashboard-advice";
import {
  buildDashboardDays,
  getDashboardDateRange,
  getLast7DayKeys,
  type DashboardDay,
} from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const accessToken = await getAccessTokenFromRequest();
  const appUser = await getAppUserFromAccessToken(accessToken);

  if (!appUser) {
    redirect("/login");
  }

  const { weekStart, todayDate } = getDashboardDateRange();
  const dayKeys = getLast7DayKeys();

  const reports = await prisma.dailyReport.findMany({
    where: {
      userId: appUser.id,
      reportDate: { gte: weekStart, lte: todayDate },
    },
    orderBy: { reportDate: "asc" },
    select: { reportDate: true, fog: true, mood: true },
  });

  const days = buildDashboardDays(reports, dayKeys);
  const advice = buildDashboardAdvice(reports);

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">マイダッシュボード</h1>
      <p className="mt-2 text-sm text-zinc-600">
        {appUser.name} さんの直近7日間（Asia/Tokyo）
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-zinc-800">お天気図</h2>
        <p className="mt-1 text-xs text-zinc-500">
          霧（プロジェクトの見通し）と気分を日別に表示します。
        </p>
        <WeatherChart days={days} />
      </section>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h2 className="text-sm font-medium text-zinc-700">セルフケアのヒント</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-800">{advice}</p>
        <p className="mt-3 text-xs text-zinc-500">
          ※ ルールベースの短文です（Step 09 MVP）。参照: fog / mood / 入力日数。
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/checkin"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          今日のチェックイン
        </Link>
        <Link
          href="/settings"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900"
        >
          設定
        </Link>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900"
        >
          ホームへ
        </Link>
      </div>
    </main>
  );
}

function WeatherChart({ days }: { days: DashboardDay[] }) {
  return (
    <div className="mt-4 overflow-x-auto pb-2">
      <div className="flex min-w-[42rem] gap-2">
        {days.map((day) => (
          <DayCard key={day.dateKey} day={day} />
        ))}
      </div>
    </div>
  );
}

function DayCard({ day }: { day: DashboardDay }) {
  return (
    <div className="flex min-w-[5.5rem] flex-1 flex-col rounded-lg border border-zinc-200 bg-white p-3">
      <p className="text-center text-xs font-medium text-zinc-600">{day.dateLabel}</p>
      {day.hasReport ? (
        <div className="mt-3 flex flex-col items-center gap-2">
          <DayMetric label="霧" emoji={day.fogEmoji} />
          <DayMetric label="気分" emoji={day.moodEmoji} />
        </div>
      ) : (
        <p className="mt-4 text-center text-xs text-zinc-400">未入力</p>
      )}
    </div>
  );
}

function DayMetric({ label, emoji }: { label: string; emoji: string | null }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-zinc-500">{label}</span>
      <span className="text-2xl leading-none" aria-hidden>
        {emoji ?? "—"}
      </span>
    </div>
  );
}
