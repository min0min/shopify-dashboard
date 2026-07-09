"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import HeaderCalendar from "@/app/components/HeaderCalendar";

type Shop = { id: string; name: string };
type Account = { id: string; name: string; shops: Shop[] };

export default function TopNav({
  accounts,
  revenueByDate,
}: {
  accounts: Account[];
  revenueByDate: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, setPending] = useState(false);

  const { currentAccountId, currentShopId } = useMemo(() => {
    const accountMatch = pathname.match(/^\/accounts\/([^/]+)/);
    if (accountMatch) return { currentAccountId: accountMatch[1], currentShopId: "" };
    const shopMatch = pathname.match(/^\/shops\/([^/]+)/);
    if (shopMatch) {
      const shopId = shopMatch[1];
      const owner = accounts.find((a) => a.shops.some((s) => s.id === shopId));
      return { currentAccountId: owner?.id ?? "", currentShopId: shopId };
    }
    return { currentAccountId: "", currentShopId: "" };
  }, [pathname, accounts]);

  const currentAccount = accounts.find((a) => a.id === currentAccountId);

  function handleAccountChange(accountId: string) {
    if (!accountId) {
      router.push("/");
      return;
    }
    router.push(`/accounts/${accountId}`);
  }

  function handleShopChange(shopId: string) {
    if (!shopId) return;
    router.push(`/shops/${shopId}`);
  }

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setPending(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error("생성 실패");
      setNewName("");
      setAdding(false);
      router.refresh();
    } catch {
      alert("계정 추가 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-6 py-3">
        <Link href="/" className="text-sm font-semibold text-neutral-900">
          Shopify 대시보드
        </Link>

        <div className="flex items-center gap-2">
          <select
            value={currentAccountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">구글 계정 선택</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          {currentAccount && (
            <select
              value={currentShopId}
              onChange={(e) => handleShopChange(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="">샵 선택</option>
              {currentAccount.shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <Suspense fallback={null}>
          <HeaderCalendar revenueByDate={revenueByDate} />
        </Suspense>

        <div className="ml-auto">
          {adding ? (
            <form onSubmit={handleAddAccount} className="flex items-center gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="새 구글 계정 이름"
                className="w-40 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              />
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {pending ? "추가중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                }}
                className="text-sm text-neutral-400 hover:text-neutral-700"
              >
                취소
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              + 추가
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
