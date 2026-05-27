import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";
import { getAdminTeamSummary } from "@/lib/admin-stats";
import {
  FOG_ALERT_CONSECUTIVE_CHECKINS,
  getFogAlertUsers,
} from "@/lib/fog-alert";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const accessToken = await getAccessTokenFromRequest();
  const appUser = await getAppUserFromAccessToken(accessToken);

  if (!appUser) {
    redirect("/login?next=/admin");
  }

  if (appUser.role !== "admin") {
    redirect("/");
  }

  const [summary, fogAlerts] = await Promise.all([
    getAdminTeamSummary(),
    getFogAlertUsers(),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">管理者コンソール</h1>
      <p className="mt-2 text-sm text-zinc-600">
        チーム全体の参加状況と FOG アラートを確認できます。
      </p>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-medium text-zinc-800">チームサマリー</h2>
        <p className="mt-1 text-xs text-zinc-500">集計期間（7日）: {summary.periodLabel}</p>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <StatCard
            label="今日の参加率"
            value={`${summary.todayParticipationPercent}%`}
            detail={`${summary.todayParticipantCount} / ${summary.userCount} 名`}
          />
          <StatCard
            label="直近7日の参加率"
            value={`${summary.weekParticipationPercent}%`}
            detail={`${summary.weekParticipantCount} / ${summary.userCount} 名`}
          />
          <StatCard
            label="直近7日の元気スコア平均"
            value={
              summary.avgVitalityScore === null
                ? "—"
                : summary.avgVitalityScore.toFixed(2)
            }
            detail="算出式: 6 − fog の平均（レポート件数ベース）"
          />
          <StatCard
            label="チームゲージ（参考）"
            value={`${summary.teamGaugePercent}%`}
            detail="参加率50% + 元気度50%（lib/pizza-meter.ts と同式）"
          />
        </dl>

        <div className="mt-5">
          <p className="text-xs font-medium text-zinc-500">チームゲージ</p>
          <TeamGaugeBar percent={summary.teamGaugePercent} />
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-medium text-zinc-800">FOG アラート</h2>
        <p className="mt-1 text-xs text-zinc-500">
          直近のチェックインから遡り、濃霧（fog=3）が{" "}
          {FOG_ALERT_CONSECUTIVE_CHECKINS} 回連続したメンバー（Step 11 定義）
        </p>

        {fogAlerts.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">
            現在、該当するメンバーはいません。
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-2 pr-4 font-medium">表示名</th>
                  <th className="py-2 pr-4 font-medium">メール</th>
                  <th className="py-2 pr-4 font-medium">連続濃霧</th>
                  <th className="py-2 font-medium">直近チェックイン</th>
                </tr>
              </thead>
              <tbody>
                {fogAlerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 text-zinc-900">{alert.name}</td>
                    <td className="py-3 pr-4 text-zinc-700">{alert.email}</td>
                    <td className="py-3 pr-4 text-zinc-900">
                      {alert.consecutiveHeavyFogDays} 日
                    </td>
                    <td className="py-3 text-zinc-700">{alert.latestReportDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-10">
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

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3">
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-zinc-900">{value}</dd>
      <dd className="mt-1 text-xs text-zinc-500">{detail}</dd>
    </div>
  );
}

function TeamGaugeBar({ percent }: { percent: number }) {
  return (
    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-zinc-200">
      <div
        className="h-full rounded-full bg-orange-500 transition-[width]"
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
