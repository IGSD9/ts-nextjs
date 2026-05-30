import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminAuditLogSection } from "@/components/admin-audit-log-section";
import { AdminMembersSection } from "@/components/admin-members-section";
import { TeamConditionLogo } from "@/components/team-condition-logo";
import { getAdminAuditLogs } from "@/lib/admin-audit-log";
import { getAdminMembers } from "@/lib/admin-members";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const secondaryButtonClass =
  "rounded-xl border border-[#304d5a] bg-white px-5 py-2.5 text-sm font-medium text-[#173b4a] shadow-[0_2px_6px_rgba(31,76,96,0.14)] transition hover:bg-[#f7fbfb]";

export default async function AdminMembersPage() {
  const accessToken = await getAccessTokenFromRequest();
  const appUser = await getAppUserFromAccessToken(accessToken);

  if (!appUser) {
    redirect("/login?next=/admin/members");
  }

  if (appUser.role !== "admin") {
    redirect("/");
  }

  const [membersResult, auditLogs] = await Promise.all([
    getAdminMembers(),
    getAdminAuditLogs(),
  ]);

  return (
    <main className="home-screen-bg min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-[#d9dfde] bg-white/90 px-6 py-8 shadow-[0_20px_40px_rgba(10,43,56,0.12)] backdrop-blur-sm sm:px-8">
        <div className="text-center">
          <TeamConditionLogo className="mx-auto mb-2 h-10 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#173b4a]">
            メンバー・操作履歴
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            登録ユーザーの一覧、管理者の確認、最終ログイン、チームメッセージの編集履歴を表示します。
          </p>
        </div>

        <AdminMembersSection data={membersResult} />
        <AdminAuditLogSection entries={auditLogs} />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/admin" className={secondaryButtonClass}>
            管理者コンソールへ戻る
          </Link>
          <Link href="/" className={secondaryButtonClass}>
            ホームへ
          </Link>
        </div>
      </section>
    </main>
  );
}
