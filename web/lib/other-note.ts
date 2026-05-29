export const OTHER_NOTE_MAX_LENGTH = 500;

export const OTHER_NOTES_PERIODS = ["7d", "14d", "30d", "all"] as const;
export type OtherNotesPeriod = (typeof OTHER_NOTES_PERIODS)[number];

export const OTHER_NOTES_PERIOD_OPTIONS: {
  value: OtherNotesPeriod;
  label: string;
}[] = [
  { value: "7d", label: "直近7日" },
  { value: "14d", label: "直近14日" },
  { value: "30d", label: "直近1ヶ月（30日）" },
  { value: "all", label: "すべて表示" },
];

export function parseOtherNotesPeriod(value: string | undefined): OtherNotesPeriod {
  if (value && OTHER_NOTES_PERIODS.includes(value as OtherNotesPeriod)) {
    return value as OtherNotesPeriod;
  }
  return "7d";
}

export function parseOtherNoteFromForm(
  value: FormDataEntryValue | null,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, OTHER_NOTE_MAX_LENGTH);
}
