import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getUsdToKrwRate } from "@/app/lib/exchangeRate";
import {
  collectAvailableMonths,
  lastNMonths,
  monthlyRevenueSeries,
  shopFixedCostTotal,
  shopOrderCostForMonth,
  shopRevenueForMonth,
  shopTaxForMonth,
} from "@/app/lib/calc";
import SummaryCards from "@/app/components/SummaryCards";
import FixedCostManager from "@/app/components/FixedCostManager";
import RevenueManager from "@/app/components/RevenueManager";
import RevenueChart from "@/app/components/RevenueChart";
import InlineEditableName from "@/app/components/InlineEditableName";

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const { month: monthParam } = await searchParams;

  const [shop, krwRate] = await Promise.all([
    prisma.shop.findUnique({
      where: { id },
      include: {
        googleAccount: true,
        fixedCostItems: { orderBy: { createdAt: "asc" } },
        revenueEntries: { orderBy: { date: "desc" } },
      },
    }),
    getUsdToKrwRate(),
  ]);

  if (!shop) notFound();

  const months = collectAvailableMonths([shop]);
  const month = monthParam && months.includes(monthParam) ? monthParam : months[0];
  const revenue = shopRevenueForMonth(shop, month);
  const fixedCost = shopFixedCostTotal(shop);
  const orderCost = shopOrderCostForMonth(shop, month);
  const tax = shopTaxForMonth(shop, month);
  const chartSeries = monthlyRevenueSeries([shop], lastNMonths(6, month));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-800 dark:hover:text-neutral-200">
          전체 계정
        </Link>{" "}
        /{" "}
        <Link
          href={`/accounts/${shop.googleAccountId}`}
          className="hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          {shop.googleAccount.name}
        </Link>
      </div>

      <div className="mt-3">
        <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">샵</p>
        <InlineEditableName
          url={`/api/shops/${shop.id}`}
          name={shop.name}
          as="h1"
          className="text-2xl font-bold text-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div className="mt-6">
        <SummaryCards
          revenue={revenue}
          fixedCost={fixedCost}
          orderCost={orderCost}
          tax={tax}
          month={month}
          krwRate={krwRate}
        />
      </div>

      <div className="mt-6">
        <RevenueChart title={`${shop.name} 매출 추이`} data={chartSeries} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">
        <FixedCostManager shopId={shop.id} items={shop.fixedCostItems} />
        <RevenueManager shopId={shop.id} entries={shop.revenueEntries} />
      </div>
    </main>
  );
}
