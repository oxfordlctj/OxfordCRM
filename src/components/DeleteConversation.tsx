"use client";

import { deleteConversation } from "@/lib/actions";

export function DeleteConversation({ id, slug }: { id: string; slug: string }) {
  return (
    <button
      onClick={() => {
        if (confirm("Удалить этот разговор?")) deleteConversation(id, slug);
      }}
      className="ml-auto text-red-500 hover:text-red-700"
    >
      Удалить
    </button>
  );
}
