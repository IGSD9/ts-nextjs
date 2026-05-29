"use client";

import { useEffect, useMemo, useState } from "react";
import { tokyoDateString } from "@/lib/pizza-meter";

type Props = {
  gaugePercent: number;
};

/** 同一日（Asia/Tokyo）に複数回演出しないためのキー。設計の「今週」は日単位MVPに簡略化。 */
const storageKeyForDay = (day: string) => `tc_pizza_badge_shown_day_${day}`;

export function PizzaBadge({ gaugePercent }: Props) {
  const dayKey = useMemo(() => tokyoDateString(), []);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    if (gaugePercent < 100) return undefined;

    const timer = window.setTimeout(() => {
      try {
        const key = storageKeyForDay(dayKey);
        if (!window.localStorage.getItem(key)) {
          setShowBurst(true);
          window.localStorage.setItem(key, "1");
        }
      } catch {
        setShowBurst(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [gaugePercent, dayKey]);

  if (gaugePercent < 100) return null;

  return (
    <div className="mt-4 flex items-center gap-3">
      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
        ピザ満タン
      </span>
      {showBurst ? (
        <span className="text-sm text-zinc-600" aria-live="polite">
          チームの勢いが最高潮です
        </span>
      ) : null}
    </div>
  );
}
