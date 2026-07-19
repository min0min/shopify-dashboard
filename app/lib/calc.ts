export type FixedCostItemLike = { amount: number };
export type RevenueEntryLike = { date: string; amount: number; orderCost: number };
export type ShopLike = {
  fixedCostItems: FixedCostItemLike[];
  revenueEntries: RevenueEntryLike[];
};

/** 매출에 부과되는 세율 */
export const TAX_RATE = 0.12;

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function currentDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function shopFixedCostTotal(shop: ShopLike): number {
  return shop.fixedCostItems.reduce((sum, item) => sum + item.amount, 0);
}

export function shopRevenueForMonth(shop: ShopLike, month: string): number {
  return shop.revenueEntries
    .filter((entry) => entry.date.startsWith(month))
    .reduce((sum, entry) => sum + entry.amount, 0);
}

export function shopOrderCostForMonth(shop: ShopLike, month: string): number {
  return shop.revenueEntries
    .filter((entry) => entry.date.startsWith(month))
    .reduce((sum, entry) => sum + entry.orderCost, 0);
}

export function shopRevenueForDate(shop: ShopLike, date: string): number {
  return shop.revenueEntries
    .filter((entry) => entry.date === date)
    .reduce((sum, entry) => sum + entry.amount, 0);
}

export function shopTaxForMonth(shop: ShopLike, month: string): number {
  return shopRevenueForMonth(shop, month) * TAX_RATE;
}

export function shopNetProfitForMonth(shop: ShopLike, month: string): number {
  return (
    shopRevenueForMonth(shop, month) -
    shopFixedCostTotal(shop) -
    shopOrderCostForMonth(shop, month) -
    shopTaxForMonth(shop, month)
  );
}

export function lastNMonths(n: number, endMonth?: string): string[] {
  const [endYear, endM] = (endMonth ?? currentMonth()).split("-").map(Number);
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(endYear, endM - 1 - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function collectAvailableMonths(shops: ShopLike[]): string[] {
  const months = new Set<string>();
  months.add(currentMonth());
  for (const shop of shops) {
    for (const entry of shop.revenueEntries) months.add(entry.date.slice(0, 7));
  }
  return Array.from(months).sort().reverse();
}

export function sumTotals(shops: ShopLike[], month: string) {
  return shops.reduce(
    (acc, shop) => {
      acc.revenue += shopRevenueForMonth(shop, month);
      acc.fixedCost += shopFixedCostTotal(shop);
      acc.orderCost += shopOrderCostForMonth(shop, month);
      acc.tax += shopTaxForMonth(shop, month);
      return acc;
    },
    { revenue: 0, fixedCost: 0, orderCost: 0, tax: 0 }
  );
}

/** date (YYYY-MM-DD) -> summed revenue across the given shops */
export function revenueByDate(shops: ShopLike[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const shop of shops) {
    for (const entry of shop.revenueEntries) {
      map.set(entry.date, (map.get(entry.date) ?? 0) + entry.amount);
    }
  }
  return map;
}

/** Monthly revenue series across the given shops, for the given months (chronological order) */
export function monthlyRevenueSeries(
  shops: ShopLike[],
  months: string[]
): { month: string; revenue: number }[] {
  const sorted = [...months].sort();
  return sorted.map((month) => ({
    month,
    revenue: shops.reduce((sum, shop) => sum + shopRevenueForMonth(shop, month), 0),
  }));
}

/** Truncates (never rounds) to 2 decimal places, e.g. 65.45555 -> 65.45 */
export function truncateToCents(amount: number): number {
  const sign = amount < 0 ? -1 : 1;
  return (sign * Math.floor(Math.abs(amount) * 100)) / 100;
}

export function formatCurrency(amount: number): string {
  const truncated = truncateToCents(amount);
  return truncated.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Converts a USD amount to KRW using the given rate, truncated to a whole won. */
export function formatKRW(amountUsd: number, rate: number): string {
  const won = Math.floor(truncateToCents(amountUsd) * rate);
  return `₩${won.toLocaleString("ko-KR")}`;
}
