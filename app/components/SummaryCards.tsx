import { formatCurrency, formatKRW } from "@/app/lib/calc";

export default function SummaryCards({
  revenue,
  fixedCost,
  orderCost,
  month,
  krwRate,
}: {
  revenue: number;
  fixedCost: number;
  orderCost: number;
  month: string;
  krwRate: number;
}) {
  const netProfit = revenue - fixedCost - orderCost;
  const cards = [
    {
      label: "총 매출",
      value: revenue,
      tone: "text-neutral-900 dark:text-neutral-100",
    },
    {
      label: "총 고정비",
      value: fixedCost,
      tone: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "총 발주가격",
      value: orderCost,
      tone: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "순이익",
      value: netProfit,
      tone:
        netProfit >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">{month} 기준</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
          >
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{c.label}</p>
            <p className={`mt-1 text-xl sm:text-2xl font-semibold ${c.tone}`}>
              {formatCurrency(c.value)}
            </p>
            <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
              {formatKRW(c.value, krwRate)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
