import Link from "next/link";
import { redirect } from "next/navigation";
import { TeamConditionLogo } from "@/components/team-condition-logo";
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

const primaryButtonClass =
  "rounded-xl border border-[#1e4555] bg-[#1f4c60] px-5 py-2.5 text-sm font-medium text-white shadow-[0_3px_8px_rgba(31,76,96,0.28)] transition hover:bg-[#163b4a]";
const secondaryButtonClass =
  "rounded-xl border border-[#304d5a] bg-white px-5 py-2.5 text-sm font-medium text-[#173b4a] shadow-[0_2px_6px_rgba(31,76,96,0.14)] transition hover:bg-[#f7fbfb]";

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
    <main className="home-screen-bg min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#d9dfde] bg-white/90 px-6 py-8 shadow-[0_20px_40px_rgba(10,43,56,0.12)] backdrop-blur-sm sm:px-8">
        <div className="text-center">
          <TeamConditionLogo className="mx-auto mb-2 h-10 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#173b4a]">
            マイダッシュボード
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            {appUser.name} さんの直近7日間（Asia/Tokyo）
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-[#e8eeed] bg-[#f7fbfb]/60 p-4">
          <h2 className="text-base font-semibold text-[#173b4a]">お天気図</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">
            霧（プロジェクトの見通し）と気分を日別に表示します。
          </p>
          <WeatherChart days={days} />
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8eeed]">
          <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3">
            <h2 className="text-sm font-semibold text-[#173b4a]">セルフケアのヒント</h2>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed text-zinc-700">{advice}</p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/checkin" className={primaryButtonClass}>
            今日のチェックイン
          </Link>
          <Link href="/settings" className={secondaryButtonClass}>
            設定
          </Link>
          <Link href="/" className={secondaryButtonClass}>
            ホームへ
          </Link>
        </div>
      </section>
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
    <div
      className={`flex min-w-[5.5rem] flex-1 flex-col rounded-xl border p-3 ${
        day.hasReport
          ? "border-[#c5d8d8] bg-white shadow-[0_2px_6px_rgba(31,76,96,0.08)]"
          : "border-[#e8eeed] bg-white/80"
      }`}
    >
      <p className="text-center text-xs font-medium text-[#1f4c60]">{day.dateLabel}</p>
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
      <span className="text-[10px] font-medium text-zinc-500">{label}</span>
      <span className="text-2xl leading-none" aria-hidden>
        {emoji ?? "—"}
      </span>
    </div>
  );
}
