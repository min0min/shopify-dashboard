export type SettlementEntryLike = {
  type: string;
  date: string;
  amount: number;
};

/** Net wallet balance: sum of deposits minus withdrawals, across all entries. */
export function settlementBalance(entries: SettlementEntryLike[]): number {
  return entries.reduce(
    (sum, entry) => sum + (entry.type === "DEPOSIT" ? entry.amount : -entry.amount),
    0
  );
}

/** date (YYYY-MM-DD) -> that day's deposit and withdrawal totals */
export function settlementByDate(
  entries: SettlementEntryLike[]
): Map<string, { deposit: number; withdrawal: number }> {
  const map = new Map<string, { deposit: number; withdrawal: number }>();
  for (const entry of entries) {
    const current = map.get(entry.date) ?? { deposit: 0, withdrawal: 0 };
    if (entry.type === "DEPOSIT") current.deposit += entry.amount;
    else current.withdrawal += entry.amount;
    map.set(entry.date, current);
  }
  return map;
}
