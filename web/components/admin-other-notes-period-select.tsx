"use client";

import { PeriodSelect } from "@/components/period-select";
import type { OtherNotesPeriod } from "@/lib/other-note";

type AdminOtherNotesPeriodSelectProps = {
  value: OtherNotesPeriod;
};

export function AdminOtherNotesPeriodSelect({
  value,
}: AdminOtherNotesPeriodSelectProps) {
  return (
    <PeriodSelect value={value} basePath="/admin" paramKey="notesPeriod" />
  );
}
