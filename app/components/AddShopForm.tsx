"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddShopForm({ googleAccountId }: { googleAccountId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), googleAccountId }),
      });
      if (!res.ok) throw new Error("생성 실패");
      setName("");
      router.refresh();
    } catch {
      alert("샵 추가 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="새 샵 이름 (예: 샵 1)"
        className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "추가중..." : "샵 추가"}
      </button>
    </form>
  );
}
