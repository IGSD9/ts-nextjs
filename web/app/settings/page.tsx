import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/user-name";
import { PwaInstallGuide } from "@/components/pwa-install-guide";
import { updateDisplayNameAction } from "./actions";

export const dynamic = "force-dynamic";

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
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">設定</h1>
      <p className="mt-2 text-sm text-zinc-600">
        表示名を変更できます（再ログイン後も保持されます）。
      </p>

      {saved ? (
        <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          表示名を保存しました。
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <form action={updateDisplayNameAction} className="mt-8 space-y-4">
        <label htmlFor="display-name" className="block text-sm font-medium text-zinc-700">
          表示名
        </label>
        <input
          id="display-name"
          name="name"
          type="text"
          required
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          defaultValue={appUser.name}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
          autoComplete="name"
        />
        <p className="text-xs text-zinc-500">
          {DISPLAY_NAME_MAX_LENGTH}文字以内。前後の空白は保存時に除去されます。
        </p>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          保存する
        </button>
      </form>

      <PwaInstallGuide />

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900"
        >
          ダッシュボードへ
        </Link>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-600"
        >
          ホームへ
        </Link>
      </div>
    </main>
  );
}
