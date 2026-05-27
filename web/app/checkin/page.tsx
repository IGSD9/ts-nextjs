import { CheckinForm } from "./checkin-form";

export default function CheckinPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold">今日のチェックイン</h1>
      <p className="mt-2 text-sm text-zinc-600">
        6項目をタップで選んで送信してください（同日再送信は上書き）。
      </p>
      {searchParams.error ? (
        <p className="mt-3 text-sm text-red-700">
          入力値が不正です。もう一度選択して送信してください。
        </p>
      ) : null}
      <div className="mt-6">
        <CheckinForm />
      </div>
    </main>
  );
}

