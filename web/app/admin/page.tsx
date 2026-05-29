import Link from "next/link";
import { redirect } from "next/navigation";
import { TeamConditionLogo } from "@/components/team-condition-logo";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";
import { AdminPositiveMessagesSection } from "@/components/admin-positive-messages-section";
import { AdminOtherNotesPeriodSelect } from "@/components/admin-other-notes-period-select";
import { getAdminOtherNotes } from "@/lib/admin-other-notes";
import { parseOtherNotesPeriod } from "@/lib/other-note";
import { getAdminTeamSummary } from "@/lib/admin-stats";
import {
  FOG_ALERT_CONSECUTIVE_CHECKINS,
  getFogAlertUsers,
} from "@/lib/fog-alert";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const secondaryButtonClass =
  "rounded-xl border border-[#304d5a] bg-white px-5 py-2.5 text-sm font-medium text-[#173b4a] shadow-[0_2px_6px_rgba(31,76,96,0.14)] transition hover:bg-[#f7fbfb]";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    notesPeriod?: string;
    msgSaved?: string;
    msgDeleted?: string;
    msgError?: string;
  }>;
}) {
  const accessToken = await getAccessTokenFromRequest();
  const appUser = await getAppUserFromAccessToken(accessToken);

  if (!appUser) {
    redirect("/login?next=/admin");
  }

  if (appUser.role !== "admin") {
    redirect("/");
  }

  const { notesPeriod: notesPeriodParam, msgSaved, msgDeleted, msgError } =
    await searchParams;
  const notesPeriod = parseOtherNotesPeriod(notesPeriodParam);
  const messageError = msgError ? decodeURIComponent(msgError) : null;

  const [summary, fogAlerts, otherNotesResult, positiveMessages] =
    await Promise.all([
      getAdminTeamSummary(),
      getFogAlertUsers(),
      getAdminOtherNotes(notesPeriod),
      prisma.positiveMessage.findMany({
        orderBy: { id: "asc" },
        select: { id: true, content: true },
      }),
    ]);

  return (
    <main className="home-screen-bg min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-[#d9dfde] bg-white/90 px-6 py-8 shadow-[0_20px_40px_rgba(10,43,56,0.12)] backdrop-blur-sm sm:px-8">
        <div className="text-center">
          <TeamConditionLogo className="mx-auto mb-2 h-10 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#173b4a]">
            管理者コンソール
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            チーム全体の参加状況と FOG アラートを確認できます。
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-[#e8eeed] bg-[#f7fbfb]/60 p-5">
          <h2 className="text-base font-semibold text-[#173b4a]">チームサマリー</h2>
          <p className="mt-1 text-xs text-zinc-600">
            集計期間（7日）: {summary.periodLabel}
          </p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
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

          <div className="mt-5 rounded-xl border border-[#e8eeed] bg-white p-3">
            <p className="text-xs font-medium text-[#1f4c60]">チームゲージ</p>
            <TeamGaugeBar percent={summary.teamGaugePercent} />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8eeed]">
          <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3">
            <h2 className="text-base font-semibold text-[#173b4a]">FOG アラート</h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
              直近のチェックインから遡り、濃霧（fog=3）が{" "}
              {FOG_ALERT_CONSECUTIVE_CHECKINS} 回連続したメンバー
            </p>
          </div>

          <div className="px-4 py-4">
            {fogAlerts.length === 0 ? (
              <p className="rounded-xl border border-[#e8eeed] bg-[#f7fbfb] px-3 py-3 text-sm text-zinc-600">
                現在、該当するメンバーはいません。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e8eeed] text-[#1f4c60]">
                      <th className="py-2 pr-4 font-medium">表示名</th>
                      <th className="py-2 pr-4 font-medium">メール</th>
                      <th className="py-2 pr-4 font-medium">連続濃霧</th>
                      <th className="py-2 font-medium">直近チェックイン</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fogAlerts.map((alert) => (
                      <tr key={alert.id} className="border-b border-[#f0f4f3]">
                        <td className="py-3 pr-4 font-medium text-[#173b4a]">
                          {alert.name}
                        </td>
                        <td className="py-3 pr-4 text-zinc-700">{alert.email}</td>
                        <td className="py-3 pr-4 text-[#173b4a]">
                          {alert.consecutiveHeavyFogDays} 日
                        </td>
                        <td className="py-3 text-zinc-700">{alert.latestReportDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8eeed]">
          <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3">
            <h2 className="text-base font-semibold text-[#173b4a]">
              その他（相談・連絡）
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
              メンバーが記入した内容です（{otherNotesResult.periodLabel}・
              {otherNotesResult.periodRangeLabel}）。FOG アラートの回数には含みません。
            </p>
          </div>

          <div className="space-y-3 px-4 py-4">
            <AdminOtherNotesPeriodSelect value={otherNotesResult.period} />

            {otherNotesResult.entries.length === 0 ? (
              <p className="rounded-xl border border-[#e8eeed] bg-[#f7fbfb] px-3 py-3 text-sm text-zinc-600">
                選択した期間に記入はありません。
              </p>
            ) : (
              otherNotesResult.entries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-xl border border-[#e8eeed] bg-white p-4 shadow-[0_2px_6px_rgba(31,76,96,0.06)]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-[#173b4a]">{entry.userName}</p>
                    <p className="text-xs text-zinc-500">{entry.reportDate}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{entry.userEmail}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                    {entry.otherNote}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <AdminPositiveMessagesSection
          messages={positiveMessages}
          saved={msgSaved === "1"}
          deleted={msgDeleted === "1"}
          errorMessage={messageError}
        />

        <div className="mt-8 flex justify-center">
          <Link href="/" className={secondaryButtonClass}>
            ホームへ
          </Link>
        </div>
      </section>
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
    <div className="rounded-xl border border-[#e8eeed] bg-white p-3 shadow-[0_2px_6px_rgba(31,76,96,0.06)]">
      <dt className="text-xs font-medium text-[#1f4c60]">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-[#173b4a]">{value}</dd>
      <dd className="mt-1 text-xs leading-relaxed text-zinc-500">{detail}</dd>
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
