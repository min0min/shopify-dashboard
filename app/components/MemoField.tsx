"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MemoField({
  url,
  memo,
}: {
  url: string;
  memo: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(memo ?? "");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed === (memo ?? "")) {
      setEditing(false);
      return;
    }
    setPending(true);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo: trimmed }),
      });
      if (!res.ok) throw new Error("수정 실패");
      setEditing(false);
      router.refresh();
    } catch {
      alert("메모 저장 중 오류가 발생했습니다.");
      setValue(memo ?? "");
    } finally {
      setPending(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditing(false);
              setValue(memo ?? "");
            }
          }}
          placeholder="메모"
          className="w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1 text-xs text-neutral-900 dark:text-neutral-100"
        />
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50"
        >
          저장
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="max-w-32 truncate text-left text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
      title={memo ?? "메모 추가"}
    >
      {memo || "+ 메모 추가"}
    </button>
  );
}
