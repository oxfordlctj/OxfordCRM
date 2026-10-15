"use client";

import { deleteMeeting } from "@/lib/actions";

export function DeleteMeeting({ id }: { id: string }) {
  return (
    <button
      onClick={() => {
        if (confirm("Удалить это заседание?")) deleteMeeting(id);
      }}
      className="text-xs text-ink-400 hover:text-red-600"
    >
      Удалить заседание
    </button>
  );
}
