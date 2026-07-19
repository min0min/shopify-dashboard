"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import HeaderCalendar from "@/app/components/HeaderCalendar";

type Shop = { id: string; name: string };
type Account = { id: string; name: string; shops: Shop[] };

function ShopBagLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M6.5 8a5.5 5.5 0 0 1 11 0"
        stroke="#5E8E3E"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="4" y="7.5" width="16" height="13" rx="3.2" fill="#95BF47" />
      <path
        d="M8.7 11v1.2a3.3 3.3 0 0 0 6.6 0V11"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

  const selectClass =
    "rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm text-neutral-900 dark:text-neutral-100";

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <ShopBagLogo />
          Shopify 대시보드
        </Link>

        <div className="flex items-center gap-2">
          <select
            value={currentAccountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            className={selectClass}
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
              className={selectClass}
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
                className="w-40 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-neutral-900 dark:bg-white px-3 py-1.5 text-sm font-medium text-white dark:text-neutral-900 disabled:opacity-50"
              >
                {pending ? "추가중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                }}
                className="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                취소
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              + 추가
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
