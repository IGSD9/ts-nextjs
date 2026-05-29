import { CheckinForm } from "./checkin-form";

export default function CheckinPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="home-screen-bg min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#d9dfde] bg-white/90 px-6 py-8 shadow-[0_20px_40px_rgba(10,43,56,0.12)] backdrop-blur-sm sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#173b4a]">
          今日のチェックイン
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          6項目をタップで選び、必要なら一番下の「その他」に記入して送信してください（同日再送信は上書き）。
        </p>
        {searchParams.error ? (
          <p className="mt-4 rounded-xl border border-[#e8c4c4] bg-[#fdf5f5] px-3 py-2 text-sm text-[#8b3a3a]">
            入力値が不正です。もう一度選択して送信してください。
          </p>
        ) : null}
        <div className="mt-6">
          <CheckinForm />
        </div>
      </section>
    </main>
  );
}
