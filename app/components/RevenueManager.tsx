"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TAX_RATE, currentDate, formatCurrency } from "@/app/lib/calc";
import DeleteButton from "@/app/components/DeleteButton";
import MemoField from "@/app/components/MemoField";

type RevenueEntry = {
  id: string;
  date: string;
  amount: number;
  orderCost: number;
  memo: string | null;
};

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
  const [orderCost, setOrderCost] = useState("");
  const [memo, setMemo] = useState("");
  const [pending, setPending] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editOrderCost, setEditOrderCost] = useState("");
  const [editPending, setEditPending] = useState(false);

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  function startEdit(entry: RevenueEntry) {
    setEditingId(entry.id);
    setEditDate(entry.date);
    setEditAmount(String(entry.amount));
    setEditOrderCost(String(entry.orderCost));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleEditSubmit(e: React.FormEvent, id: string) {
    e.preventDefault();
    const amountNum = Number(editAmount);
    const orderCostNum = Number(editOrderCost);
    if (!editDate || Number.isNaN(amountNum) || Number.isNaN(orderCostNum)) return;
    setEditPending(true);
    try {
      const res = await fetch(`/api/revenue/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: editDate, amount: amountNum, orderCost: orderCostNum }),
      });
      if (!res.ok) throw new Error("수정 실패");
      setEditingId(null);
      router.refresh();
    } catch {
      alert("매출 수정 중 오류가 발생했습니다.");
    } finally {
      setEditPending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    const orderCostNum = orderCost === "" ? 0 : Number(orderCost);
    if (!date || Number.isNaN(amountNum) || Number.isNaN(orderCostNum)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/revenue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, amount: amountNum, orderCost: orderCostNum, memo }),
      });
      if (!res.ok) throw new Error("저장 실패");
      setAmount("");
      setOrderCost("");
      setMemo("");
      router.refresh();
    } catch {
      alert("매출 입력 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">일별 매출</h2>
      <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
        매출을 입력할 때 아마존 발주가격도 함께 입력해주세요.
      </p>

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          아직 입력된 매출이 없습니다.
        </p>
      ) : (
        <div className="mt-4 max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400 dark:text-neutral-500">
                <th className="pb-2 font-medium">날짜</th>
                <th className="pb-2 font-medium">매출</th>
                <th className="pb-2 font-medium">발주가격</th>
                <th className="pb-2 font-medium">세금</th>
                <th className="pb-2 font-medium">순이익</th>
                <th className="pb-2 font-medium">메모</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {sorted.map((entry) => {
                if (editingId === entry.id) {
                  return (
                    <tr key={entry.id}>
                      <td className="py-2" colSpan={7}>
                        <form
                          onSubmit={(e) => handleEditSubmit(e, entry.id)}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100"
                          />
                          <input
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="매출 금액"
                            inputMode="decimal"
                            className="w-28 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100"
                          />
                          <input
                            value={editOrderCost}
                            onChange={(e) => setEditOrderCost(e.target.value)}
                            placeholder="발주가격"
                            inputMode="decimal"
                            className="w-28 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100"
                          />
                          <button
                            type="submit"
                            disabled={editPending}
                            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                          >
                            취소
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                }

                const tax = entry.amount * TAX_RATE;
                const net = entry.amount - entry.orderCost - tax;
                return (
                  <tr key={entry.id}>
                    <td className="py-2 text-neutral-700 dark:text-neutral-300">{entry.date}</td>
                    <td className="py-2 font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="py-2 font-medium text-amber-600 dark:text-amber-400">
                      {formatCurrency(entry.orderCost)}
                    </td>
                    <td className="py-2 font-medium text-orange-600 dark:text-orange-400">
                      {formatCurrency(tax)}
                    </td>
                    <td
                      className={`py-2 font-medium ${
                        net >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {formatCurrency(net)}
                    </td>
                    <td className="py-2">
                      <MemoField url={`/api/revenue/${entry.id}`} memo={entry.memo} />
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="mr-2 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        aria-label="수정"
                        title="수정"
                      >
                        ✎
                      </button>
                      <DeleteButton
                        url={`/api/revenue/${entry.id}`}
                        confirmMessage={`${entry.date} 매출 기록을 삭제할까요?`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
          placeholder="매출 금액"
          inputMode="decimal"
          className="flex-1 min-w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
        <input
          value={orderCost}
          onChange={(e) => setOrderCost(e.target.value)}
          placeholder="발주가격(아마존)"
          inputMode="decimal"
          className="flex-1 min-w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
        <input
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모 (선택)"
          className="flex-1 min-w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 disabled:opacity-50"
        >
          {pending ? "저장중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
