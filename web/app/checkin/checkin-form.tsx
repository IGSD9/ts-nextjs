"use client";

import { useMemo, useState } from "react";
import {
  CHECKIN_CODES,
  CHECKIN_EMOJIS,
  CHECKIN_OPTION_ARIA_LABELS,
} from "@/lib/checkin-codes";
import { submitCheckinAction } from "./actions";

type FieldKey = keyof typeof CHECKIN_CODES;

const fieldLabels: Record<FieldKey, string> = {
  sleep: "睡眠",
  body: "体の重さ",
  mood: "今の気分",
  fog: "プロジェクトの霧",
  energy: "バッテリー",
  connection: "つながり",
};

const fieldHelper: Record<FieldKey, string> = {
  sleep: "ぐっすり眠れて、疲れは取れていますか？",
  body: "肩こりや目の疲れ、痛みはないですか？",
  mood: "漠然とした不安やイライラはないですか？",
  fog: "次に何をすべきか、進め方は見えていますか？",
  energy: "仕事に取り組む気力は残っていますか？",
  connection: "今日、誰かと雑談や相談をしましたか？",
};

const WEDNESDAY_EXTRA_OPTIONS = [1, 2, 3, 4, 5] as const;

export function CheckinForm() {
  const [values, setValues] = useState<Record<FieldKey, number | null>>({
    sleep: null,
    body: null,
    mood: null,
    fog: null,
    energy: null,
    connection: null,
  });

  const [wednesdayExtra, setWednesdayExtra] = useState<number | null>(null);

  const isWednesday = useMemo(() => {
    // Step 07 方針: ローカルタイムゾーンで曜日判定する。
    return new Date().getDay() === 3;
  }, []);

  const reportDate = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const day = `${now.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const isComplete = (Object.keys(values) as FieldKey[]).every(
    (key) => values[key] !== null,
  );

  return (
    <form action={submitCheckinAction} className="space-y-6">
      <input type="hidden" name="reportDate" value={reportDate} />

      {(Object.keys(CHECKIN_CODES) as FieldKey[]).map((field) => (
        <section key={field} className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">{fieldHelper[field]}</p>
          <p className="mt-1 text-lg font-semibold">{fieldLabels[field]}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {CHECKIN_CODES[field].map((code, index) => {
              const selected = values[field] === code;
              const emoji = CHECKIN_EMOJIS[field][index];
              const optionLabel = CHECKIN_OPTION_ARIA_LABELS[field][index];
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setValues((prev) => ({ ...prev, [field]: code }))}
                  aria-label={`${fieldLabels[field]}: ${optionLabel}`}
                  className={`rounded-md border px-3 py-4 text-2xl leading-none ${
                    selected
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 bg-white text-zinc-800"
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          <input type="hidden" name={field} value={values[field] ?? ""} />
        </section>
      ))}

      {isWednesday ? (
        <section className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">最近笑った？（水曜限定・任意）</p>
          <p className="mt-1 text-lg font-semibold">気分の軽さ</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {WEDNESDAY_EXTRA_OPTIONS.map((n) => {
              const selected = wednesdayExtra === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setWednesdayExtra((prev) => (prev === n ? null : n))
                  }
                  aria-label={`水曜の追加回答: ${n}（タップで選択／同じ数字で解除）`}
                  className={`min-w-[3.25rem] rounded-md border px-4 py-3 text-lg font-semibold ${
                    selected
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 bg-white text-zinc-800"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <input
            type="hidden"
            name="wednesdayExtra"
            value={wednesdayExtra ?? ""}
          />
        </section>
      ) : (
        <input type="hidden" name="wednesdayExtra" value="" />
      )}

      <button
        type="submit"
        disabled={!isComplete}
        className="w-full rounded-md bg-zinc-900 px-4 py-3 text-white disabled:opacity-50"
      >
        送信する
      </button>
    </form>
  );
}
