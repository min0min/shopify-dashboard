"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { currentDate, formatCurrency } from "@/app/lib/calc";
import DeleteButton from "@/app/components/DeleteButton";

type RevenueEntry = { id: string; date: string; amount: number };

export default function RevenueManager({
  shopId,
  entries,
}: {
  shopId: string;
  entries: RevenueEntry[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(currentDate());
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!date || Number.isNaN(amountNum)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/revenue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, amount: amountNum }),
      });
      if (!res.ok) throw new Error("저장 실패");
      setAmount("");
      router.refresh();
    } catch {
      alert("매출 입력 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">일별 매출</h2>

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
          아직 입력된 매출이 없습니다.
        </p>
      ) : (
        <div className="mt-4 max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400">
                <th className="pb-2 font-medium">날짜</th>
                <th className="pb-2 font-medium">매출</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sorted.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-2">{entry.date}</td>
                  <td className="py-2 font-medium">
                    {formatCurrency(entry.amount)}
                  </td>
                  <td className="py-2 text-right">
                    <DeleteButton
                      url={`/api/revenue/${entry.id}`}
                      confirmMessage={`${entry.date} 매출 기록을 삭제할까요?`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="매출 금액"
          inputMode="decimal"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "저장중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
