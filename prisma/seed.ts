import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function lastMonths(n: number): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function main() {
  const accountNames = ["계정A", "계정B", "계정C"];
  const months = lastMonths(3);

  for (const accountName of accountNames) {
    const account = await prisma.googleAccount.create({
      data: { name: accountName, order: accountNames.indexOf(accountName) },
    });

    for (let s = 1; s <= 3; s++) {
      const shop = await prisma.shop.create({
        data: {
          name: `${accountName} - 샵 ${s}`,
          googleAccountId: account.id,
          order: s,
        },
      });

      await prisma.fixedCostItem.create({
        data: { name: "Shopify 구독료", amount: 39, shopId: shop.id },
      });
      await prisma.fixedCostItem.create({
        data: { name: "앱 구독료", amount: 20, shopId: shop.id },
      });

      for (const { year, month } of months) {
        const maxDay = daysInMonth(year, month);
        const activeDaysCount = 6 + Math.floor(Math.random() * 4);
        const pickedDays = new Set<number>();
        while (pickedDays.size < activeDaysCount) {
          pickedDays.add(1 + Math.floor(Math.random() * maxDay));
        }
        for (const day of pickedDays) {
          const base = 200 + s * 40;
          const jitter = Math.floor(Math.random() * 150);
          const amount = base + jitter;
          const orderCost = Math.round(amount * (0.55 + Math.random() * 0.15) * 100) / 100;
          await prisma.revenueEntry.create({
            data: {
              shopId: shop.id,
              date: toDateStr(year, month, day),
              amount,
              orderCost,
            },
          });
        }
      }
    }
  }

  console.log("시드 데이터 생성 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
