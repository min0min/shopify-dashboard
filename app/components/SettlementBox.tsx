"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { currentDate, formatCurrency } from "@/app/lib/calc";
import DeleteButton from "@/app/components/DeleteButton";

type SettlementEntry = { id: string; date: string; amount: number; memo: string | null };

export default function SettlementBox({
  type,
  title,
  entries,
}: {
  type: "DEPOSIT" | "WITHDRAWAL";
  title: string;
  entries: SettlementEntry[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(currentDate());
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [pending, setPending] = useState(false);

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const tone =
    type === "DEPOSIT"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  const sign = type === "DEPOSIT" ? "+" : "-";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!date || Number.isNaN(amountNum) || amountNum <= 0) return;
    setPending(true);
    try {
      const res = await fetch("/api/settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, date, amount: amountNum, memo }),
      });
      if (!res.ok) throw new Error("추가 실패");
      setAmount("");
      setMemo("");
      router.refresh();
    } catch {
      alert(`${title} 추가 중 오류가 발생했습니다.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          합계{" "}
          <span className={`font-semibold ${tone}`}>
            {sign}
            {formatCurrency(total)}
          </span>
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          아직 등록된 {title} 기록이 없습니다.
        </p>
      ) : (
        <ul className="mt-4 max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
          {sorted.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="text-sm text-neutral-800 dark:text-neutral-200">{entry.date}</p>
                {entry.memo && (
                  <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">{entry.memo}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`text-sm font-medium ${tone}`}>
                  {sign}
                  {formatCurrency(entry.amount)}
                </span>
                <DeleteButton
                  url={`/api/settlement/${entry.id}`}
                  confirmMessage={`${entry.date} ${title} 기록을 삭제할까요?`}
                  label="－"
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="금액"
          inputMode="decimal"
          className="flex-1 min-w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
        <input
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모 (선택)"
          className="flex-1 min-w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 disabled:opacity-50"
        >
          {pending ? "추가중..." : "+ 추가"}
        </button>
      </form>
    </div>
  );
}
