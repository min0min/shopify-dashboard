import { prisma } from "@/app/lib/prisma";
import { getUsdToKrwRate } from "@/app/lib/exchangeRate";
import { collectAvailableMonths, lastNMonths, monthlyRevenueSeries, sumTotals } from "@/app/lib/calc";
import SummaryCards from "@/app/components/SummaryCards";
import AccountCard from "@/app/components/AccountCard";
import AddAccountForm from "@/app/components/AddAccountForm";
import RevenueChart from "@/app/components/RevenueChart";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;

  const [accounts, krwRate] = await Promise.all([
    prisma.googleAccount.findMany({
      orderBy: { order: "asc" },
      include: {
        shops: {
          orderBy: { order: "asc" },
          include: { fixedCostItems: true, revenueEntries: true },
        },
      },
    }),
    getUsdToKrwRate(),
  ]);

  const allShops = accounts.flatMap((a) => a.shops);
  const months = collectAvailableMonths(allShops);
  const month = monthParam && months.includes(monthParam) ? monthParam : months[0];
  const totals = sumTotals(allShops, month);
  const chartSeries = monthlyRevenueSeries(allShops, lastNMonths(6, month));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          샵 매출 · 고정비 대시보드
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          구글 계정별로 묶인 쇼피파이 샵의 매출, 고정비, 순이익을 확인하세요.
        </p>
      </div>

      <div className="mt-6">
        <SummaryCards
          revenue={totals.revenue}
          fixedCost={totals.fixedCost}
          orderCost={totals.orderCost}
          month={month}
          krwRate={krwRate}
        />
      </div>

      <div className="mt-6">
        <RevenueChart title="전체 매출 추이" data={chartSeries} />
      </div>

      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            구글 계정
          </h2>
        </div>
        <div className="mb-4">
          <AddAccountForm />
        </div>
        {accounts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            아직 등록된 구글 계정이 없습니다. 위에서 추가해보세요.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const accTotals = sumTotals(account.shops, month);
              return (
                <AccountCard
                  key={account.id}
                  id={account.id}
                  name={account.name}
                  shopCount={account.shops.length}
                  revenue={accTotals.revenue}
                  fixedCost={accTotals.fixedCost}
                  orderCost={accTotals.orderCost}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
