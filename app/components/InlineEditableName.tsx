"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InlineEditableName({
  url,
  name,
  as: Tag = "span",
  className = "",
}: {
  url: string;
  name: string;
  as?: "span" | "h1" | "h3";
  className?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) {
      setEditing(false);
      setValue(name);
      return;
    }
    setPending(true);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("수정 실패");
      setEditing(false);
      router.refresh();
    } catch {
      alert("이름 수정 중 오류가 발생했습니다.");
      setValue(name);
    } finally {
      setPending(false);
    }
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.preventDefault()}
        className="flex items-center gap-2"
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditing(false);
              setValue(name);
            }
          }}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100"
        />
        <button
          type="submit"
          disabled={pending}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50"
        >
          저장
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditing(false);
            setValue(name);
          }}
          className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          취소
        </button>
      </form>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <Tag className={className}>{name}</Tag>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setEditing(true);
        }}
        className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        aria-label="이름 수정"
        title="이름 수정"
      >
        ✎
      </button>
    </span>
  );
}
