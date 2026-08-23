"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCreatedDate, parseDate } from "@/app/lib/calc";

export default function InlineEditableDate({
  url,
  value,
  label = "생성일",
}: {
  url: string;
  /** Currently effective date, YYYY-MM-DD */
  value: string;
  label?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!draft || draft === value) {
      setEditing(false);
      setDraft(value);
      return;
    }
    setPending(true);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeFrom: draft }),
      });
      if (!res.ok) throw new Error("수정 실패");
      setEditing(false);
      router.refresh();
    } catch {
      alert("생성일 수정 중 오류가 발생했습니다.");
      setDraft(value);
    } finally {
      setPending(false);
    }
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.preventDefault()}
        className="flex items-center gap-1.5"
      >
        <input
          type="date"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditing(false);
              setDraft(value);
            }
          }}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1 text-xs text-neutral-900 dark:text-neutral-100"
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
            setDraft(value);
          }}
          className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          취소
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
      className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
      title="생성일 수정"
    >
      {label} {formatCreatedDate(parseDate(value))} ✎
    </button>
  );
}
