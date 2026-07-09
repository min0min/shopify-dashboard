import Link from "next/link";
import { formatCurrency } from "@/app/lib/calc";
import DeleteButton from "@/app/components/DeleteButton";
import InlineEditableName from "@/app/components/InlineEditableName";

export default function ShopCard({
  id,
  name,
  revenue,
  fixedCost,
}: {
  id: string;
  name: string;
  revenue: number;
  fixedCost: number;
}) {
  const netProfit = revenue - fixedCost;
  return (
    <Link
      href={`/shops/${id}`}
      className="group block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">
            샵
          </p>
          <InlineEditableName
            url={`/api/shops/${id}`}
            name={name}
            as="h3"
            className="mt-1 text-lg font-semibold"
          />
        </div>
        <DeleteButton
          url={`/api/shops/${id}`}
          confirmMessage={`"${name}" 샵과 관련 데이터를 삭제할까요?`}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-neutral-400">매출</p>
          <p className="font-medium">{formatCurrency(revenue)}</p>
        </div>
        <div>
          <p className="text-neutral-400">고정비</p>
          <p className="font-medium text-rose-600">
            {formatCurrency(fixedCost)}
          </p>
        </div>
        <div>
          <p className="text-neutral-400">순이익</p>
          <p
            className={`font-medium ${
              netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>
    </Link>
  );
}
