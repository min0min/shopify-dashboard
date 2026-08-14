"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  daysInMonth,
  formatRangeLabel,
  parseRangeParams,
  presetRanges,
  type DateRange,
} from "@/app/lib/calc";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MIN_YEAR = 2025;

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function formatKoreanDate(date: string | null): string {
  if (!date) return "";
  const [y, m, d] = date.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

function MonthGrid({
  year,
  month,
  draftFrom,
  draftTo,
  revenueByDate,
  onDayMouseDown,
  onDayMouseEnter,
}: {
  year: number;
  month: number;
  draftFrom: string | null;
  draftTo: string | null;
  revenueByDate: Record<string, number>;
  onDayMouseDown: (date: string) => void;
  onDayMouseEnter: (date: string) => void;
}) {
  const totalDays = daysInMonth(year, month);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const dayCells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className="flex-1">
      <p className="mb-2 text-center text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {year}년 {month}월
      </p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs select-none">
        {dayCells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />;
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isStart = dateStr === draftFrom;
          const isEnd = dateStr === draftTo;
          const isEndpoint = isStart || isEnd;
          const isInRange = !!draftFrom && !!draftTo && dateStr >= draftFrom && dateStr <= draftTo;
          const hasRevenue = (revenueByDate[dateStr] ?? 0) > 0;
          return (
            <button
              key={dateStr}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onDayMouseDown(dateStr);
              }}
              onMouseEnter={() => onDayMouseEnter(dateStr)}
              className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                isEndpoint
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  : isInRange
                  ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              }`}
            >
              {day}
              {hasRevenue && (
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                    isEndpoint ? "bg-white dark:bg-neutral-900" : "bg-emerald-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({
  revenueByDate,
}: {
  revenueByDate: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const popoverRef = useRef<HTMLDivElement>(null);

  const committed: DateRange = parseRangeParams(
    searchParams.get("from") ?? undefined,
    searchParams.get("to") ?? undefined
  );

  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState<string | null>(committed.from);
  const [draftTo, setDraftTo] = useState<string | null>(committed.to);
  const [anchorDate, setAnchorDate] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rightView, setRightView] = useState(() => {
    const [y, m] = committed.to.split("-").map(Number);
    return { year: y, month: m };
  });
  const leftView = shiftMonth(rightView.year, rightView.month, -1);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    function onMouseUp() {
      setIsDragging(false);
    }
    if (isDragging) window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [isDragging]);

  function openPicker() {
    setDraftFrom(committed.from);
    setDraftTo(committed.to);
    setAnchorDate(null);
    const [y, m] = committed.to.split("-").map(Number);
    setRightView({ year: y, month: m });
    setOpen(true);
  }

  function handleDayMouseDown(date: string) {
    setAnchorDate(date);
    setIsDragging(true);
    setDraftFrom(date);
    setDraftTo(date);
  }

  function handleDayMouseEnter(date: string) {
    if (!isDragging || !anchorDate) return;
    if (date < anchorDate) {
      setDraftFrom(date);
      setDraftTo(anchorDate);
    } else {
      setDraftFrom(anchorDate);
      setDraftTo(date);
    }
  }

  function applyPreset(range: DateRange) {
    setAnchorDate(null);
    setIsDragging(false);
    setDraftFrom(range.from);
    setDraftTo(range.to);
    const [y, m] = range.to.split("-").map(Number);
    setRightView({ year: y, month: m });
  }

  function handleApply() {
    if (!draftFrom || !draftTo) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", draftFrom);
    params.set("to", draftTo);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  const canGoPrev = leftView.year > MIN_YEAR || (leftView.year === MIN_YEAR && leftView.month > 1);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700"
      >
        <span aria-hidden>📅</span>
        {formatRangeLabel(committed)}
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-[560px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300">
              {formatKoreanDate(draftFrom)}
            </div>
            <span className="text-neutral-400 dark:text-neutral-500">→</span>
            <div className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300">
              {formatKoreanDate(draftTo)}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-28 shrink-0 border-r border-neutral-100 dark:border-neutral-700 pr-2">
              <ul className="flex flex-col gap-0.5">
                {presetRanges().map((preset) => (
                  <li key={preset.key}>
                    <button
                      type="button"
                      onClick={() => applyPreset(preset.range)}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      {preset.label}
                    </button>
                  </li>
                ))}
                <li>
                  <span className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100">
                    사용자 지정
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRightView((v) => shiftMonth(v.year, v.month, -1))}
                  disabled={!canGoPrev}
                  className="rounded px-2 py-1 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => setRightView((v) => shiftMonth(v.year, v.month, 1))}
                  className="rounded px-2 py-1 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  ▶
                </button>
              </div>
              <div className="flex gap-4">
                <MonthGrid
                  year={leftView.year}
                  month={leftView.month}
                  draftFrom={draftFrom}
                  draftTo={draftTo}
                  revenueByDate={revenueByDate}
                  onDayMouseDown={handleDayMouseDown}
                  onDayMouseEnter={handleDayMouseEnter}
                />
                <MonthGrid
                  year={rightView.year}
                  month={rightView.month}
                  draftFrom={draftFrom}
                  draftTo={draftTo}
                  revenueByDate={revenueByDate}
                  onDayMouseDown={handleDayMouseDown}
                  onDayMouseEnter={handleDayMouseEnter}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2 border-t border-neutral-100 dark:border-neutral-700 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!draftFrom || !draftTo}
              className="rounded-lg bg-neutral-900 dark:bg-white px-3 py-1.5 text-sm font-medium text-white dark:text-neutral-900 disabled:opacity-50"
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
