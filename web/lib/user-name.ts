/** Step 10: 表示名のサーバー検証（詳細設計の上限50文字・空禁止） */
export const DISPLAY_NAME_MAX_LENGTH = 50;

export type ParseDisplayNameResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

export function parseDisplayName(value: FormDataEntryValue | null): ParseDisplayNameResult {
  if (typeof value !== "string") {
    return { ok: false, error: "表示名を入力してください。" };
  }

  const name = value.trim();
  if (name.length === 0) {
    return { ok: false, error: "表示名は空にできません。" };
  }
  if (name.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `表示名は${DISPLAY_NAME_MAX_LENGTH}文字以内で入力してください。`,
    };
  }

  return { ok: true, name };
}
