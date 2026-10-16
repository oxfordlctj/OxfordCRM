"use client";

import { useTransition } from "react";
import { deleteMemoryFact } from "@/lib/actions";

export function DeleteFact({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteMemoryFact(id))}
      disabled={pending}
      className="text-xs text-ink-300 hover:text-red-600"
      title="Забыть"
    >
      ✕
    </button>
  );
}
