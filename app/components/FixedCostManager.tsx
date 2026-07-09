"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/app/lib/calc";
import DeleteButton from "@/app/components/DeleteButton";

type FixedCostItem = { id: string; name: string; amount: number };

export default function FixedCostManager({
  shopId,
  items,
}: {
  shopId: string;
  items: FixedCostItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!name.trim() || Number.isNaN(amountNum)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/fixed-costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), amount: amountNum }),
      });
      if (!res.ok) throw new Error("추가 실패");
      setName("");
      setAmount("");
      router.refresh();
    } catch {
      alert("고정비 추가 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">고정비 항목</h2>
        <p className="text-sm text-neutral-500">
          월 합계{" "}
          <span className="font-semibold text-rose-600">
            {formatCurrency(total)}
          </span>
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
          등록된 고정비 항목이 없습니다.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2">
              <span className="text-sm">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-rose-600">
                  {formatCurrency(item.amount)}
                </span>
                <DeleteButton
                  url={`/api/fixed-costs/${item.id}`}
                  confirmMessage={`"${item.name}" 항목을 삭제할까요?`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="항목명 (예: Shopify 구독료)"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="금액 (예: 39)"
          inputMode="decimal"
          className="w-28 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "추가중..." : "추가"}
        </button>
      </form>
    </div>
  );
}
