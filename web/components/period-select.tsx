"use client";

import {
  OTHER_NOTES_PERIOD_OPTIONS,
  type OtherNotesPeriod,
} from "@/lib/other-note";

type PeriodSelectProps = {
  value: OtherNotesPeriod;
  basePath: string;
  paramKey: string;
  defaultPeriod?: OtherNotesPeriod;
};

export function PeriodSelect({
  value,
  basePath,
  paramKey,
  defaultPeriod = "7d",
}: PeriodSelectProps) {
  return (
    <label className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <span className="text-xs font-medium text-[#1f4c60]">期間を選ぶ</span>
      <select
        value={value}
        onChange={(event) => {
          const next = event.target.value as OtherNotesPeriod;
          const params = new URLSearchParams(window.location.search);
          if (next === defaultPeriod) {
            params.delete(paramKey);
          } else {
            params.set(paramKey, next);
          }
          const query = params.toString();
          window.location.href = query ? `${basePath}?${query}` : basePath;
        }}
        className="rounded-xl border border-[#d9dfde] bg-white px-3 py-2 text-sm text-[#173b4a] shadow-[0_1px_3px_rgba(31,76,96,0.08)] outline-none transition focus:border-[#1f4c60] focus:ring-2 focus:ring-[#1f4c60]/20"
      >
        {OTHER_NOTES_PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
