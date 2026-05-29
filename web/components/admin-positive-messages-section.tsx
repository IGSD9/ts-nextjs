import {
  createPositiveMessageAction,
  updatePositiveMessageAction,
} from "@/app/admin/actions";
import { DeletePositiveMessageButton } from "@/components/delete-positive-message-button";
import { POSITIVE_MESSAGE_MAX_LENGTH } from "@/lib/positive-message";

type AdminPositiveMessagesSectionProps = {
  messages: { id: string; content: string }[];
  saved: boolean;
  deleted: boolean;
  errorMessage: string | null;
};

const primaryButtonClass =
  "rounded-xl border border-[#1e4555] bg-[#1f4c60] px-4 py-2 text-sm font-medium text-white shadow-[0_3px_8px_rgba(31,76,96,0.28)] transition hover:bg-[#163b4a]";
const secondaryButtonClass =
  "rounded-xl border border-[#304d5a] bg-white px-4 py-2 text-sm font-medium text-[#173b4a] shadow-[0_2px_6px_rgba(31,76,96,0.14)] transition hover:bg-[#f7fbfb]";

export function AdminPositiveMessagesSection({
  messages,
  saved,
  deleted,
  errorMessage,
}: AdminPositiveMessagesSectionProps) {
  return (
    <section
      id="team-messages"
      className="mt-6 overflow-hidden rounded-2xl border border-[#e8eeed]"
    >
      <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3">
        <h2 className="text-base font-semibold text-[#173b4a]">
          チームメッセージ（Message from Team）
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-600">
          チェックイン完了画面にランダムで1件表示されます。追加・編集・削除できます。
        </p>
      </div>

      <div className="space-y-4 px-4 py-4">
        {saved ? (
          <p className="rounded-xl border border-[#b8d4c8] bg-[#f0f7f3] px-3 py-2 text-sm text-[#2d5a45]">
            メッセージを保存しました。
          </p>
        ) : null}
        {deleted ? (
          <p className="rounded-xl border border-[#b8d4c8] bg-[#f0f7f3] px-3 py-2 text-sm text-[#2d5a45]">
            メッセージを削除しました。
          </p>
        ) : null}
        {errorMessage ? (
          <p className="rounded-xl border border-[#e8c4c4] bg-[#fdf5f5] px-3 py-2 text-sm text-[#8b3a3a]">
            {errorMessage}
          </p>
        ) : null}

        <form
          action={createPositiveMessageAction}
          className="rounded-xl border border-[#e8eeed] bg-[#f7fbfb] p-4"
        >
          <p className="text-sm font-medium text-[#173b4a]">新規追加</p>
          <textarea
            name="content"
            rows={3}
            maxLength={POSITIVE_MESSAGE_MAX_LENGTH}
            required
            placeholder="例: 今日もチェックインありがとう。チームの一歩になっています。"
            className="mt-3 w-full resize-y rounded-xl border border-[#d9dfde] bg-white px-3 py-2.5 text-sm leading-relaxed text-[#173b4a] placeholder:text-zinc-400 outline-none transition focus:border-[#1f4c60] focus:ring-2 focus:ring-[#1f4c60]/20"
          />
          <p className="mt-1 text-xs text-zinc-500">
            最大 {POSITIVE_MESSAGE_MAX_LENGTH} 文字
          </p>
          <button type="submit" className={`mt-3 ${primaryButtonClass}`}>
            追加する
          </button>
        </form>

        {messages.length === 0 ? (
          <p className="rounded-xl border border-[#e8eeed] bg-[#f7fbfb] px-3 py-3 text-sm text-zinc-600">
            登録されているメッセージはありません。完了画面では「準備中」と表示されます。
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className="rounded-xl border border-[#e8eeed] bg-white p-4 shadow-[0_2px_6px_rgba(31,76,96,0.06)]"
              >
                <p className="text-xs font-medium text-zinc-500">ID: {message.id}</p>
                <form action={updatePositiveMessageAction} className="mt-3">
                  <input type="hidden" name="id" value={message.id} />
                  <textarea
                    name="content"
                    rows={3}
                    maxLength={POSITIVE_MESSAGE_MAX_LENGTH}
                    required
                    defaultValue={message.content}
                    className="w-full resize-y rounded-xl border border-[#d9dfde] bg-[#f7fbfb] px-3 py-2.5 text-sm leading-relaxed text-[#173b4a] outline-none transition focus:border-[#1f4c60] focus:bg-white focus:ring-2 focus:ring-[#1f4c60]/20"
                  />
                  <button type="submit" className={`mt-3 ${secondaryButtonClass}`}>
                    保存
                  </button>
                </form>
                <div className="mt-2">
                  <DeletePositiveMessageButton id={message.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
