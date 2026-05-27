import Link from "next/link";
import { Prisma } from "@prisma/client";
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
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-semibold">チェックイン完了</h1>
      <p className="mt-3 text-zinc-600">
        今日の入力ありがとうございました。
      </p>

      {randomMessage ? (
        <section className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Message from Team
          </p>
          <p className="mt-2 text-base text-zinc-900">{randomMessage}</p>
        </section>
      ) : (
        <p className="mt-8 text-sm text-zinc-600">
          チームからのメッセージは準備中です。また明日チェックインしてください。
        </p>
      )}

      <section className="mt-8">
        <p className="text-sm font-medium text-zinc-700">ピザメーター</p>
        <p className="mt-1 text-xs text-zinc-500">
          参加率（当日・Tokyo）と直近7日の元気スコア平均（6 − fog）から 0–100 を算出（MVP固定式は
          <code className="rounded bg-zinc-100 px-1">lib/pizza-meter.ts</code>
          ）。
        </p>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-orange-500 transition-[width]"
            style={{ width: `${gaugePercent}%` }}
            role="progressbar"
            aria-valuenow={gaugePercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          {gaugePercent}%（今日の参加 {todayReportCount} / {userCount} 名・7日平均元気{" "}
          {avgVitality === null ? "—" : avgVitality.toFixed(2)}）
        </p>
        <PizzaBadge gaugePercent={gaugePercent} />
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-block rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900"
        >
          ホームへ
        </Link>
        <Link
          href="/checkin"
          className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-white"
        >
          もう一度チェックイン
        </Link>
      </div>
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
