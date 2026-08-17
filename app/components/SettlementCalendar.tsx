"use client";

import { useState } from "react";
import { daysInMonth, formatCurrency } from "@/app/lib/calc";
import { settlementByDate, type SettlementEntryLike } from "@/app/lib/settlement";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export default function SettlementCalendar({ entries }: { entries: SettlementEntryLike[] }) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const byDate = settlementByDate(entries);

  const totalDays = daysInMonth(view.year, view.month);
  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
  const dayCells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm sm:w-80">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView((v) => shiftMonth(v.year, v.month, -1))}
          className="rounded px-2 py-1 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ◀
        </button>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {view.year}년 {view.month}월
        </span>
        <button
          type="button"
          onClick={() => setView((v) => shiftMonth(v.year, v.month, 1))}
          className="rounded px-2 py-1 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ▶
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {dayCells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />;
          const dateStr = `${view.year}-${String(view.month).padStart(2, "0")}-${String(day).padStart(
            2,
            "0"
          )}`;
          const amounts = byDate.get(dateStr);
          return (
            <div key={dateStr} className="flex flex-col items-center gap-0.5 py-0.5">
              <span className="text-xs text-neutral-700 dark:text-neutral-300">{day}</span>
              {amounts?.deposit ? (
                <span className="text-[9px] leading-none text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(amounts.deposit)}
                </span>
              ) : null}
              {amounts?.withdrawal ? (
                <span className="text-[9px] leading-none text-rose-600 dark:text-rose-400">
                  -{formatCurrency(amounts.withdrawal)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
