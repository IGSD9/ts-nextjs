export const POSITIVE_MESSAGE_MAX_LENGTH = 300;

export type ParsePositiveMessageResult =
  | { ok: true; content: string }
  | { ok: false; error: string };

export function parsePositiveMessageContent(
  value: FormDataEntryValue | null,
): ParsePositiveMessageResult {
  if (typeof value !== "string") {
    return { ok: false, error: "メッセージを入力してください。" };
  }

  const content = value.trim();
  if (content.length === 0) {
    return { ok: false, error: "メッセージは空にできません。" };
  }
  if (content.length > POSITIVE_MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      error: `メッセージは${POSITIVE_MESSAGE_MAX_LENGTH}文字以内で入力してください。`,
    };
  }

  return { ok: true, content };
}

export function parsePositiveMessageId(
  value: FormDataEntryValue | null,
): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim();
  return id.length > 0 ? id : null;
}
