"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({
  url,
  confirmMessage,
  onDoneRedirectTo,
  label = "삭제",
  className = "",
}: {
  url: string;
  confirmMessage: string;
  onDoneRedirectTo?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(confirmMessage)) return;
    setPending(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      if (onDoneRedirectTo) {
        router.push(onDoneRedirectTo);
      }
      router.refresh();
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`text-xs text-neutral-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-50 ${className}`}
    >
      {pending ? "삭제중..." : label}
    </button>
  );
}
