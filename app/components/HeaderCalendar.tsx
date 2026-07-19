"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { daysInMonth, formatCurrency } from "@/app/lib/calc";

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MIN_YEAR = 2025;

export default function HeaderCalendar({
  revenueByDate,
}: {
  revenueByDate: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentMonthParam = searchParams.get("month");
  const now = new Date();
  const [year, month] = currentMonthParam
    ? currentMonthParam.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);
  const [viewMonth, setViewMonth] = useState(month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function applyMonth(y: number, m: number) {
    const monthStr = `${y}-${String(m).padStart(2, "0")}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", monthStr);
    router.push(`${pathname}?${params.toString()}`);
  }

  function monthHasRevenue(y: number, m: number) {
    const prefix = `${y}-${String(m).padStart(2, "0")}`;
    return Object.keys(revenueByDate).some((d) => d.startsWith(prefix));
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstWeekday = new Date(viewYear, viewMonth - 1, 1).getDay();
  const dayCells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const buttonLabel = `${year}-${String(month).padStart(2, "0")}`;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => {
          setViewYear(year);
          setViewMonth(month);
          setOpen((v) => !v);
        }}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700"
      >
        <span aria-hidden>📅</span>
        {buttonLabel}
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-72 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewYear((y) => Math.max(MIN_YEAR, y - 1))}
              disabled={viewYear <= MIN_YEAR}
              className="rounded px-2 py-1 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30"
            >
              ◀
            </button>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {viewYear}년
            </span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="rounded px-2 py-1 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              ▶
            </button>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-1">
            {MONTH_NAMES.map((label, i) => {
              const m = i + 1;
              const isSelected = viewYear === year && m === month;
              const isViewing = m === viewMonth;
              const hasRevenue = monthHasRevenue(viewYear, m);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setViewMonth(m);
                    applyMonth(viewYear, m);
                  }}
                  className={`relative rounded-lg px-1.5 py-1.5 text-xs ${
                    isSelected
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : isViewing
                      ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  }`}
                >
                  {label}
                  {hasRevenue && (
                    <span
                      className={`absolute right-1 top-1 h-1 w-1 rounded-full ${
                        isSelected ? "bg-white dark:bg-neutral-900" : "bg-emerald-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-neutral-100 dark:border-neutral-700 pt-2">
            <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
              {dayCells.map((day, i) => {
                if (day === null) return <span key={`blank-${i}`} />;
                const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(
                  day
                ).padStart(2, "0")}`;
                const hasRevenue = (revenueByDate[dateStr] ?? 0) > 0;
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative mx-auto flex h-6 w-6 items-center justify-center rounded-full ${
                      isSelected
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {day}
                    {hasRevenue && (
                      <span
                        className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                          isSelected ? "bg-white dark:bg-neutral-900" : "bg-emerald-500"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <p className="mt-2 border-t border-neutral-100 dark:border-neutral-700 pt-2 text-center text-xs text-neutral-600 dark:text-neutral-400">
              {selectedDate} 총 매출{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(revenueByDate[selectedDate] ?? 0)}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
