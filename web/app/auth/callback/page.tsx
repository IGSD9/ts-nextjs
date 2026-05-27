"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("認証を確認しています...");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          throw new Error("セッションが見つかりませんでした。再度ログインしてください。");
        }

        setStatus("セッションを保存しています...");
        const setSessionResponse = await fetch("/api/auth/set-session", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!setSessionResponse.ok) {
          throw new Error("セッション保存に失敗しました。");
        }

        setStatus("ユーザー情報を同期しています...");
        const response = await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(body?.error ?? "ユーザー同期に失敗しました。");
        }

        setStatus("ログインが完了しました。");
        router.replace("/");
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "認証処理中にエラーが発生しました。",
        );
      }
    };

    void run();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">ログイン処理中</h1>
      <p className="mt-3 text-sm text-zinc-600">{status}</p>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </main>
  );
}
