import Link from "next/link";
import { TeamConditionLogo } from "@/components/team-condition-logo";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const accessToken = await getAccessTokenFromRequest();
  const appUser = await getAppUserFromAccessToken(accessToken);
  const isAdmin = appUser?.role === "admin";

  return (
    <main className="home-screen-bg flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-3xl rounded-3xl border border-[#d9dfde] bg-white/90 px-8 py-10 text-center shadow-[0_20px_40px_rgba(10,43,56,0.12)] backdrop-blur-sm">
        <TeamConditionLogo className="mx-auto mb-3 h-14 w-auto" />

        <h1 className="text-5xl font-semibold tracking-tight text-[#173b4a]">
          Team Condition
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          毎日のコンディションを記録し、チームの状態を見える化します。
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/checkin"
            className="rounded-xl border border-[#1e4555] bg-[#1f4c60] px-6 py-2.5 text-sm font-medium text-white shadow-[0_3px_8px_rgba(31,76,96,0.28)] transition hover:bg-[#163b4a]"
          >
            🙂 今日のチェックイン
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-[#304d5a] bg-white px-6 py-2.5 text-sm font-medium text-[#173b4a] shadow-[0_2px_6px_rgba(31,76,96,0.14)] transition hover:bg-[#f7fbfb]"
          >
            マイダッシュボード
          </Link>
          <Link
            href="/settings"
            className="rounded-xl border border-[#304d5a] bg-white px-6 py-2.5 text-sm font-medium text-[#173b4a] shadow-[0_2px_6px_rgba(31,76,96,0.14)] transition hover:bg-[#f7fbfb]"
          >
            設定
          </Link>
        </div>

        {isAdmin || !appUser ? (
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-xl border border-[#b8934c] bg-[#c4a05e] px-6 py-2.5 text-sm font-medium text-white shadow-[0_3px_8px_rgba(142,107,35,0.25)] transition hover:bg-[#b58f4f]"
              >
                管理者コンソール
              </Link>
            ) : null}
            {!appUser ? (
              <Link
                href="/login"
                className="rounded-xl border border-[#304d5a] bg-white px-6 py-2.5 text-sm font-medium text-[#173b4a] shadow-[0_2px_6px_rgba(31,76,96,0.14)] transition hover:bg-[#f7fbfb]"
              >
                ログインへ進む
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
