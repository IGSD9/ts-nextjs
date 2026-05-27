"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (signInError) {
        throw signInError;
      }

      setMessage("ログインリンクを送信しました。メールを確認してください。");
    } catch (caughtError) {
      const fallback = "ログインリンクの送信に失敗しました。時間をおいて再試行してください。";
      setError(caughtError instanceof Error ? caughtError.message : fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">ログイン</h1>
      <p className="mt-2 text-sm text-zinc-600">
        メールアドレスを入力すると、マジックリンクを送信します。
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium" htmlFor="email">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? "送信中..." : "マジックリンクを送信"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <Link className="mt-8 text-sm text-zinc-600 underline" href="/">
        トップへ戻る
      </Link>
    </main>
  );
}

