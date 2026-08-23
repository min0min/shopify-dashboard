export type FixedCostItemLike = { amount: number };
export type RevenueEntryLike = { date: string; amount: number; orderCost: number };
export type ShopLike = {
  createdAt: Date;
  activeFrom: string | null;
  fixedCostItems: FixedCostItemLike[];
  revenueEntries: RevenueEntryLike[];
};

/** 매출에 부과되는 세율 */
export const TAX_RATE = 0.12;

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

export function shopRevenueForDate(shop: ShopLike, date: string): number {
  return shop.revenueEntries
    .filter((entry) => entry.date === date)
    .reduce((sum, entry) => sum + entry.amount, 0);
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

// ---------------------------------------------------------------------------
// Date ranges
// ---------------------------------------------------------------------------

export type DateRange = { from: string; to: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

export function parseDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function offsetDate(date: string, days: number): string {
  const d = parseDate(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function rangeDayCount(from: string, to: string): number {
  const diff = parseDate(to).getTime() - parseDate(from).getTime();
  return Math.round(diff / 86400000) + 1;
}

function eachDateInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const end = parseDate(to);
  const cursor = parseDate(from);
  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function monthsInRange(from: string, to: string): string[] {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  const months: string[] = [];
  let y = fy;
  let m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return months;
}

export function defaultRange(): DateRange {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return { from: `${y}-${String(m).padStart(2, "0")}-01`, to: currentDate() };
}

export function parseRangeParams(from?: string, to?: string): DateRange {
  if (from && to && DATE_RE.test(from) && DATE_RE.test(to) && from <= to) {
    return { from, to };
  }
  return defaultRange();
}

function formatDot(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}.${m}.${d}`;
}

export function formatCreatedDate(date: Date): string {
  return formatDot(formatDate(date));
}

export function formatRangeLabel({ from, to }: DateRange): string {
  if (from === to) return formatDot(from);
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  if (fy === ty && fm === tm) return `${fy}.${fm}.${Number(from.split("-")[2])} - ${td}`;
  return `${formatDot(from)} - ${formatDot(to)}`;
}

export type PresetRange = { key: string; label: string; range: DateRange };

/** Shopify-style quick preset ranges, anchored on today. */
export function presetRanges(): PresetRange[] {
  const today = currentDate();
  const [ty, tm] = today.split("-").map(Number);

  const monthStart = `${ty}-${String(tm).padStart(2, "0")}-01`;
  const prevMonthDate = new Date(ty, tm - 2, 1);
  const prevY = prevMonthDate.getFullYear();
  const prevM = prevMonthDate.getMonth() + 1;
  const prevMonthStart = `${prevY}-${String(prevM).padStart(2, "0")}-01`;
  const prevMonthEnd = `${prevY}-${String(prevM).padStart(2, "0")}-${String(
    daysInMonth(prevY, prevM)
  ).padStart(2, "0")}`;

  const quarterStartMonth = Math.floor((tm - 1) / 3) * 3 + 1;
  const quarterStart = `${ty}-${String(quarterStartMonth).padStart(2, "0")}-01`;

  const yearStart = `${ty}-01-01`;
  const lastYear = ty - 1;

  return [
    { key: "today", label: "오늘", range: { from: today, to: today } },
    { key: "yesterday", label: "어제", range: { from: offsetDate(today, -1), to: offsetDate(today, -1) } },
    { key: "last7", label: "지난 7일", range: { from: offsetDate(today, -6), to: today } },
    { key: "last30", label: "지난 30일", range: { from: offsetDate(today, -29), to: today } },
    { key: "thisMonth", label: "이번 달", range: { from: monthStart, to: today } },
    { key: "lastMonth", label: "지난 달", range: { from: prevMonthStart, to: prevMonthEnd } },
    { key: "thisQuarter", label: "이번 분기", range: { from: quarterStart, to: today } },
    { key: "thisYear", label: "올해", range: { from: yearStart, to: today } },
    { key: "lastYear", label: "작년", range: { from: `${lastYear}-01-01`, to: `${lastYear}-12-31` } },
  ];
}

// ---------------------------------------------------------------------------
// Per-shop / totals for a date range
// ---------------------------------------------------------------------------

export function shopRevenueForRange(shop: ShopLike, from: string, to: string): number {
  return shop.revenueEntries
    .filter((entry) => inRange(entry.date, from, to))
    .reduce((sum, entry) => sum + entry.amount, 0);
}

export function shopOrderCostForRange(shop: ShopLike, from: string, to: string): number {
  return shop.revenueEntries
    .filter((entry) => inRange(entry.date, from, to))
    .reduce((sum, entry) => sum + entry.orderCost, 0);
}

export function shopTaxForRange(shop: ShopLike, from: string, to: string): number {
  return shopRevenueForRange(shop, from, to) * TAX_RATE;
}

/** The date fixed costs start applying from: the user-set override, or the shop's creation date. */
export function shopActiveFromDate(shop: ShopLike): string {
  return shop.activeFrom ?? formatDate(shop.createdAt);
}

/**
 * Prorates the flat monthly fixed cost across the days actually covered by the range,
 * clipped to start no earlier than the shop's active-from date (a shop can't owe fixed
 * costs for days before it existed / went live).
 */
export function shopFixedCostForRange(shop: ShopLike, from: string, to: string): number {
  const monthlyTotal = shopFixedCostTotal(shop);
  if (monthlyTotal === 0) return 0;
  const activeFrom = shopActiveFromDate(shop);
  const effectiveFrom = activeFrom > from ? activeFrom : from;
  if (effectiveFrom > to) return 0;
  return eachDateInRange(effectiveFrom, to).reduce((sum, date) => {
    const [y, m] = date.split("-").map(Number);
    return sum + monthlyTotal / daysInMonth(y, m);
  }, 0);
}

export function shopNetProfitForRange(shop: ShopLike, from: string, to: string): number {
  return (
    shopRevenueForRange(shop, from, to) -
    shopFixedCostForRange(shop, from, to) -
    shopOrderCostForRange(shop, from, to) -
    shopTaxForRange(shop, from, to)
  );
}

export function sumTotalsForRange(shops: ShopLike[], from: string, to: string) {
  return shops.reduce(
    (acc, shop) => {
      acc.revenue += shopRevenueForRange(shop, from, to);
      acc.fixedCost += shopFixedCostForRange(shop, from, to);
      acc.orderCost += shopOrderCostForRange(shop, from, to);
      acc.tax += shopTaxForRange(shop, from, to);
      return acc;
    },
    { revenue: 0, fixedCost: 0, orderCost: 0, tax: 0 }
  );
}

// ---------------------------------------------------------------------------
// Trend chart series
// ---------------------------------------------------------------------------

export type ChartPoint = { key: string; label: string; revenue: number };

function dailyLabel(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function monthLabel(month: string): string {
  const [, m] = month.split("-");
  return `${Number(m)}월`;
}

/** Daily points for ranges of a month or less, monthly points for longer ranges. */
export function chartSeriesForRange(
  shops: ShopLike[],
  from: string,
  to: string
): { granularity: "day" | "month"; points: ChartPoint[] } {
  const revenueByDate = new Map<string, number>();
  for (const shop of shops) {
    for (const entry of shop.revenueEntries) {
      revenueByDate.set(entry.date, (revenueByDate.get(entry.date) ?? 0) + entry.amount);
    }
  }

  if (rangeDayCount(from, to) <= 31) {
    const points = eachDateInRange(from, to).map((date) => ({
      key: date,
      label: dailyLabel(date),
      revenue: revenueByDate.get(date) ?? 0,
    }));
    return { granularity: "day", points };
  }

  const revenueByMonth = new Map<string, number>();
  for (const [date, revenue] of revenueByDate) {
    const month = date.slice(0, 7);
    revenueByMonth.set(month, (revenueByMonth.get(month) ?? 0) + revenue);
  }
  const points = monthsInRange(from, to).map((month) => ({
    key: month,
    label: monthLabel(month),
    revenue: revenueByMonth.get(month) ?? 0,
  }));
  return { granularity: "month", points };
}
