import { formatCurrency } from "@/app/lib/calc";

export default function SummaryCards({
  revenue,
  fixedCost,
  month,
}: {
  revenue: number;
  fixedCost: number;
  month: string;
}) {
  const netProfit = revenue - fixedCost;
  const cards = [
    { label: "총 매출", value: revenue, tone: "text-neutral-900" },
    { label: "총 고정비", value: fixedCost, tone: "text-rose-600" },
    {
      label: "순이익",
      value: netProfit,
      tone: netProfit >= 0 ? "text-emerald-600" : "text-rose-600",
    },
  ];

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-2">{month} 기준</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${c.tone}`}>
              {formatCurrency(c.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
