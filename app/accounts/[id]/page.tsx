import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getUsdToKrwRate } from "@/app/lib/exchangeRate";
import { chartSeriesForRange, formatRangeLabel, parseRangeParams, sumTotalsForRange } from "@/app/lib/calc";
import SummaryCards from "@/app/components/SummaryCards";
import ShopCard from "@/app/components/ShopCard";
import AddShopForm from "@/app/components/AddShopForm";
import RevenueChart from "@/app/components/RevenueChart";
import InlineEditableName from "@/app/components/InlineEditableName";

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { id } = await params;
  const { from, to } = await searchParams;

  const [account, krwRate] = await Promise.all([
    prisma.googleAccount.findUnique({
      where: { id },
      include: {
        shops: {
          orderBy: { order: "asc" },
          include: { fixedCostItems: true, revenueEntries: true },
        },
      },
    }),
    getUsdToKrwRate(),
  ]);

  if (!account) notFound();

  const range = parseRangeParams(from, to);
  const totals = sumTotalsForRange(account.shops, range.from, range.to);
  const chartSeries = chartSeriesForRange(account.shops, range.from, range.to).points;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Link
        href="/"
        className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        ← 전체 계정으로
      </Link>

      <div className="mt-3">
        <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          구글 계정
        </p>
        <InlineEditableName
          url={`/api/accounts/${account.id}`}
          name={account.name}
          as="h1"
          className="text-2xl font-bold text-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div className="mt-6">
        <SummaryCards
          revenue={totals.revenue}
          fixedCost={totals.fixedCost}
          orderCost={totals.orderCost}
          tax={totals.tax}
          rangeLabel={formatRangeLabel(range)}
          krwRate={krwRate}
        />
      </div>

      <div className="mt-6">
        <RevenueChart title={`${account.name} 매출 추이`} data={chartSeries} />
      </div>

      <div className="mt-10">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            샵 (스토어)
          </h2>
        </div>
        <div className="mb-4">
          <AddShopForm googleAccountId={account.id} />
        </div>
        {account.shops.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            아직 등록된 샵이 없습니다. 위에서 추가해보세요.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {account.shops.map((shop) => {
              const shopTotals = sumTotalsForRange([shop], range.from, range.to);
              return (
                <ShopCard
                  key={shop.id}
                  id={shop.id}
                  name={shop.name}
                  revenue={shopTotals.revenue}
                  fixedCost={shopTotals.fixedCost}
                  orderCost={shopTotals.orderCost}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
