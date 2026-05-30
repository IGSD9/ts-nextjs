import { Suspense } from "react";
import { LoginPageClient } from "@/components/login-page-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="home-screen-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-sm text-zinc-600">読み込み中...</p>
        </main>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
