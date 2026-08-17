import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getUsdToKrwRate } from "@/app/lib/exchangeRate";
import { formatCurrency, formatKRW } from "@/app/lib/calc";
import { settlementBalance } from "@/app/lib/settlement";
import SettlementCalendar from "@/app/components/SettlementCalendar";
import SettlementBox from "@/app/components/SettlementBox";

export default async function SettlementPage() {
  const [entries, krwRate] = await Promise.all([
    prisma.settlementEntry.findMany({ orderBy: { date: "desc" } }),
    getUsdToKrwRate(),
  ]);

  const balance = settlementBalance(entries);
  const deposits = entries.filter((e) => e.type === "DEPOSIT");
  const withdrawals = entries.filter((e) => e.type === "WITHDRAWAL");

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link
        href="/"
        className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        ← 전체 계정으로
      </Link>

      <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">정산금</p>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">정산 지갑</h1>
          <p
            className={`mt-2 text-3xl font-semibold ${
              balance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(balance)}
          </p>
          <p className="mt-0.5 text-sm text-neutral-400 dark:text-neutral-500">
            {formatKRW(balance, krwRate)}
          </p>
        </div>

        <SettlementCalendar entries={entries} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">
        <SettlementBox type="DEPOSIT" title="입금" entries={deposits} />
        <SettlementBox type="WITHDRAWAL" title="출금" entries={withdrawals} />
      </div>
    </main>
  );
}
