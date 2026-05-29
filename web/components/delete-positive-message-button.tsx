"use client";

import { deletePositiveMessageAction } from "@/app/admin/actions";

type DeletePositiveMessageButtonProps = {
  id: string;
};

export function DeletePositiveMessageButton({
  id,
}: DeletePositiveMessageButtonProps) {
  return (
    <form
      action={deletePositiveMessageAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "このメッセージを削除しますか？チェックイン完了画面の表示から外れます。",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-xl border border-[#e8c4c4] bg-white px-4 py-2 text-sm font-medium text-[#8b3a3a] transition hover:bg-[#fdf5f5]"
      >
        削除
      </button>
    </form>
  );
}
