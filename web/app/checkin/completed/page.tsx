import Link from "next/link";
import { Prisma } from "@prisma/client";
import { TeamConditionLogo } from "@/components/team-condition-logo";
import { prisma } from "@/lib/prisma";
import {
  addDaysUtc,
  clamp01,
  parseDateOnlyUtc,
  pizzaGaugePercent,
  tokyoDateString,
  vitality01FromAvgSixMinusFog,
} from "@/lib/pizza-meter";
import { PizzaBadge } from "./pizza-badge";

export const dynamic = "force-dynamic";

const primaryButtonClass =
  "rounded-xl border border-[#1e4555] bg-[#1f4c60] px-5 py-2.5 text-sm font-medium text-white shadow-[0_3px_8px_rgba(31,76,96,0.28)] transition hover:bg-[#163b4a]";
const secondaryButtonClass =
  "rounded-xl border border-[#304d5a] bg-white px-5 py-2.5 text-sm font-medium text-[#173b4a] shadow-[0_2px_6px_rgba(31,76,96,0.14)] transition hover:bg-[#f7fbfb]";

export default async function CheckinCompletedPage() {
  const todayTokyo = tokyoDateString();
  const todayDate = parseDateOnlyUtc(todayTokyo);
  const weekStart = addDaysUtc(todayDate, -6);

  const [userCount, todayReportCount, vitalityAgg, randomMessage] =
    await Promise.all([
      prisma.user.count(),
      prisma.dailyReport.count({ where: { reportDate: todayDate } }),
      prisma.dailyReport.aggregate({
        where: {
          reportDate: { gte: weekStart, lte: todayDate },
        },
        _avg: { fog: true },
      }),
      pickRandomPositiveMessage(),
    ]);

  const participation01 =
    userCount === 0 ? 0 : clamp01(todayReportCount / userCount);

  const avgFog = vitalityAgg._avg.fog;
  const avgVitality =
    avgFog === null || avgFog === undefined ? null : 6 - avgFog;
  const vitality01 = vitality01FromAvgSixMinusFog(avgVitality);

  const gaugePercent = pizzaGaugePercent(participation01, vitality01);

  return (
    <main className="home-screen-bg flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-[#d9dfde] bg-white/90 px-6 py-8 shadow-[0_20px_40px_rgba(10,43,56,0.12)] backdrop-blur-sm sm:px-8">
        <div className="text-center">
          <TeamConditionLogo className="mx-auto mb-2 h-10 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#173b4a]">
            チェックイン完了
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            今日の入力ありがとうございました。
          </p>
        </div>

        {randomMessage ? (
          <section className="mt-8 overflow-hidden rounded-2xl border border-[#e8eeed]">
            <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#1f4c60]">
                Message from Team
              </p>
            </div>
            <p className="px-4 py-4 text-base leading-relaxed text-zinc-800">
              {randomMessage}
            </p>
          </section>
        ) : (
          <p className="mt-8 rounded-xl border border-[#e8eeed] bg-[#f7fbfb] px-4 py-3 text-sm leading-relaxed text-zinc-600">
            チームからのメッセージは準備中です。また明日チェックインしてください。
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-[#e8eeed] bg-[#f7fbfb]/60 p-4">
          <p className="text-sm font-semibold text-[#173b4a]">ピザメーター</p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-orange-500 transition-[width]"
              style={{ width: `${gaugePercent}%` }}
              role="progressbar"
              aria-valuenow={gaugePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`ピザメーター ${gaugePercent}パーセント`}
            />
          </div>
          <PizzaBadge gaugePercent={gaugePercent} />
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={secondaryButtonClass}>
            ホームへ
          </Link>
          <Link href="/checkin" className={primaryButtonClass}>
            もう一度チェックイン
          </Link>
        </div>
      </section>
    </main>
  );
}

/** Step 08: DB 側乱数で 1 件（count + skip より 1 往復で済む） */
async function pickRandomPositiveMessage(): Promise<string | null> {
  const rows = await prisma.$queryRaw<Array<{ content: string }>>(
    Prisma.sql`
      SELECT "content" FROM "PositiveMessage"
      ORDER BY RANDOM()
      LIMIT 1
    `,
  );
  return rows[0]?.content ?? null;
}
