import type { AdminMembersResult } from "@/lib/admin-members";

type AdminMembersSectionProps = {
  data: AdminMembersResult;
};

export function AdminMembersSection({ data }: AdminMembersSectionProps) {
  const { summary, members } = data;

  return (
    <>
      <section className="mt-8 rounded-2xl border border-[#e8eeed] bg-[#f7fbfb]/60 p-5">
        <h2 className="text-base font-semibold text-[#173b4a]">サマリー</h2>
        <p className="mt-1 text-xs text-zinc-600">基準日（Tokyo）: {summary.todayLabel}</p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <StatCard label="登録ユーザー" value={`${summary.totalUsers} 名`} />
          <StatCard label="管理者" value={`${summary.adminCount} 名`} />
          <StatCard label="回答者（1回以上）" value={`${summary.respondentCount} 名`} />
          <StatCard
            label="今日ログイン"
            value={`${summary.loggedInTodayCount} 名`}
            detail="最終ログイン日が今日（Tokyo）"
          />
          <StatCard
            label="今日チェックイン"
            value={`${summary.checkedInTodayCount} 名`}
            detail="本日の DailyReport あり"
          />
        </dl>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8eeed]">
        <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3">
          <h2 className="text-base font-semibold text-[#173b4a]">メンバー一覧</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">
            管理者と一般ユーザーを一覧表示します。最終ログインは次回ログイン以降に記録されます。
          </p>
        </div>

        <div className="px-4 py-4">
          {members.length === 0 ? (
            <p className="rounded-xl border border-[#e8eeed] bg-[#f7fbfb] px-3 py-3 text-sm text-zinc-600">
              登録ユーザーはいません。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e8eeed] text-[#1f4c60]">
                    <th className="py-2 pr-4 font-medium">表示名</th>
                    <th className="py-2 pr-4 font-medium">ロール</th>
                    <th className="py-2 pr-4 font-medium">最終ログイン</th>
                    <th className="py-2 pr-4 font-medium">回答数</th>
                    <th className="py-2 pr-4 font-medium">最終回答日</th>
                    <th className="py-2 font-medium">今日</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-[#f0f4f3]">
                      <td className="py-3 pr-4 font-medium text-[#173b4a]">
                        {member.name}
                      </td>
                      <td className="py-3 pr-4">
                        {member.isAdmin ? (
                          <span className="inline-flex rounded-full border border-[#d4c4a0] bg-[#f8f5ea] px-2.5 py-0.5 text-xs font-medium text-[#7a5c1e]">
                            管理者
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-[#d9dfde] bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                            一般
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-zinc-700">{member.lastLoginLabel}</td>
                      <td className="py-3 pr-4 text-zinc-700">{member.reportCount}</td>
                      <td className="py-3 pr-4 text-zinc-700">
                        {member.lastReportDate ?? "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {member.loggedInToday ? (
                            <StatusChip label="ログイン" tone="teal" />
                          ) : null}
                          {member.checkedInToday ? (
                            <StatusChip label="チェックイン" tone="gold" />
                          ) : null}
                          {!member.loggedInToday && !member.checkedInToday ? (
                            <span className="text-xs text-zinc-400">—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-[#e8eeed] bg-white p-3 shadow-[0_2px_6px_rgba(31,76,96,0.06)]">
      <dt className="text-xs font-medium text-[#1f4c60]">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-[#173b4a]">{value}</dd>
      {detail ? (
        <dd className="mt-1 text-xs leading-relaxed text-zinc-500">{detail}</dd>
      ) : null}
    </div>
  );
}

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: "teal" | "gold";
}) {
  const className =
    tone === "teal"
      ? "border-[#b8d4c8] bg-[#f0f7f3] text-[#2d5a45]"
      : "border-[#d4c4a0] bg-[#f8f5ea] text-[#7a5c1e]";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
