const FALLBACK_USD_TO_KRW = 1450;

export async function getUsdToKrwRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_USD_TO_KRW;
    const data = await res.json();
    const rate = data?.rates?.KRW;
    return typeof rate === "number" && rate > 0 ? rate : FALLBACK_USD_TO_KRW;
  } catch {
    return FALLBACK_USD_TO_KRW;
  }
}
