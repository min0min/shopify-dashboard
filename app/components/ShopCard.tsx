import Link from "next/link";
import { formatCurrency } from "@/app/lib/calc";
import DeleteButton from "@/app/components/DeleteButton";
import InlineEditableName from "@/app/components/InlineEditableName";

export default function ShopCard({
  id,
  name,
  revenue,
  fixedCost,
  orderCost,
}: {
  id: string;
  name: string;
  revenue: number;
  fixedCost: number;
  orderCost: number;
}) {
  const netProfit = revenue - fixedCost - orderCost;
  return (
    <Link
      href={`/shops/${id}`}
      className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm transition hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            샵
          </p>
          <InlineEditableName
            url={`/api/shops/${id}`}
            name={name}
            as="h3"
            className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100"
          />
        </div>
        <DeleteButton
          url={`/api/shops/${id}`}
          confirmMessage={`"${name}" 샵과 관련 데이터를 삭제할까요?`}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
        <div>
          <p className="text-neutral-400 dark:text-neutral-500">매출</p>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatCurrency(revenue)}
          </p>
        </div>
        <div>
          <p className="text-neutral-400 dark:text-neutral-500">고정비</p>
          <p className="font-medium text-rose-600 dark:text-rose-400">
            {formatCurrency(fixedCost)}
          </p>
        </div>
        <div>
          <p className="text-neutral-400 dark:text-neutral-500">발주가격</p>
          <p className="font-medium text-amber-600 dark:text-amber-400">
            {formatCurrency(orderCost)}
          </p>
        </div>
        <div>
          <p className="text-neutral-400 dark:text-neutral-500">순이익</p>
          <p
            className={`font-medium ${
              netProfit >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>
    </Link>
  );
}
