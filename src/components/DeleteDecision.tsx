"use client";

import { deleteDecision } from "@/lib/actions";

export function DeleteDecision({ id }: { id: number }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Удалить решение вместе с поручениями?")) deleteDecision(id);
      }}
      className="ml-auto text-xs text-ink-400 hover:text-red-600"
    >
      Удалить
    </button>
  );
}
