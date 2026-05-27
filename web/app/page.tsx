import Link from "next/link";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const accessToken = await getAccessTokenFromRequest();
  const appUser = await getAppUserFromAccessToken(accessToken);
  const isAdmin = appUser?.role === "admin";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold">チーム・コンディション・チェッカー</h1>
      <p className="mt-3 text-zinc-600">
        毎日のコンディションを記録し、チームの状態を見える化します。
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/checkin"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          今日のチェックイン
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900"
        >
          マイダッシュボード
        </Link>
        <Link
          href="/settings"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900"
        >
          設定
        </Link>
        {isAdmin ? (
          <Link
            href="/admin"
            className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900"
          >
            管理者コンソール
          </Link>
        ) : null}
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-600"
        >
          ログインへ進む
        </Link>
      </div>
    </main>
  );
}
