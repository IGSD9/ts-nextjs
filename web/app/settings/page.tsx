import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { TeamConditionLogo } from "@/components/team-condition-logo";
import { PwaInstallGuide } from "@/components/pwa-install-guide";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/user-name";
import { updateDisplayNameAction } from "./actions";

export const dynamic = "force-dynamic";

const primaryButtonClass =
  "rounded-xl border border-[#1e4555] bg-[#1f4c60] px-5 py-2.5 text-sm font-medium text-white shadow-[0_3px_8px_rgba(31,76,96,0.28)] transition hover:bg-[#163b4a]";
const secondaryButtonClass =
  "rounded-xl border border-[#304d5a] bg-white px-5 py-2.5 text-sm font-medium text-[#173b4a] shadow-[0_2px_6px_rgba(31,76,96,0.14)] transition hover:bg-[#f7fbfb]";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const accessToken = await getAccessTokenFromRequest();
  const appUser = await getAppUserFromAccessToken(accessToken);

  if (!appUser) {
    redirect("/login");
  }

  const { saved: savedParam, error: errorParam } = await searchParams;
  const saved = savedParam === "1";
  const errorMessage = errorParam ? decodeURIComponent(errorParam) : null;

  return (
    <main className="home-screen-bg min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-[#d9dfde] bg-white/90 px-6 py-8 shadow-[0_20px_40px_rgba(10,43,56,0.12)] backdrop-blur-sm sm:px-8">
        <div className="text-center">
          <TeamConditionLogo className="mx-auto mb-2 h-10 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#173b4a]">
            設定
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            表示名の変更や、ホーム画面への追加方法を確認できます。
          </p>
        </div>

        {saved ? (
          <p className="mt-6 rounded-xl border border-[#b8d4c8] bg-[#f0f7f3] px-3 py-2 text-sm text-[#2d5a45]">
            表示名を保存しました。
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-6 rounded-xl border border-[#e8c4c4] bg-[#fdf5f5] px-3 py-2 text-sm text-[#8b3a3a]">
            {errorMessage}
          </p>
        ) : null}

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#e8eeed]">
          <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3 sm:px-5">
            <h2 className="text-base font-semibold text-[#173b4a]">表示名</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              ダッシュボードなどに表示される名前です。再ログイン後も保持されます。
            </p>
          </div>

          <form action={updateDisplayNameAction} className="space-y-4 px-4 py-4 sm:px-5">
            <label htmlFor="display-name" className="block text-sm font-medium text-[#1f4c60]">
              表示名
            </label>
            <input
              id="display-name"
              name="name"
              type="text"
              required
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              defaultValue={appUser.name}
              className="w-full rounded-xl border border-[#d9dfde] bg-[#f7fbfb] px-3 py-2.5 text-sm text-[#173b4a] outline-none transition focus:border-[#1f4c60] focus:bg-white focus:ring-2 focus:ring-[#1f4c60]/20"
              autoComplete="name"
            />
            <p className="text-xs leading-relaxed text-zinc-500">
              {DISPLAY_NAME_MAX_LENGTH}文字以内。前後の空白は保存時に除去されます。
            </p>
            <button type="submit" className={primaryButtonClass}>
              保存する
            </button>
          </form>
        </section>

        <PwaInstallGuide />

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#e8eeed]">
          <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3 sm:px-5">
            <h2 className="text-base font-semibold text-[#173b4a]">ログイン</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              ログアウトするまでログイン状態を維持します。別のアカウントに切り替える場合は、先にログアウトしてください。
            </p>
          </div>
          <div className="px-4 py-4 sm:px-5">
            <p className="text-sm text-zinc-700">
              現在の表示名: <span className="font-medium text-[#173b4a]">{appUser.name}</span>
            </p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className={secondaryButtonClass}>
            ダッシュボードへ
          </Link>
          <Link href="/" className={secondaryButtonClass}>
            ホームへ
          </Link>
        </div>
      </section>
    </main>
  );
}
