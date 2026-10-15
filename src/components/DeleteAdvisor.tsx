"use client";

import { deleteAdvisor } from "@/lib/actions";

export function DeleteAdvisor({ id }: { id: number }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Удалить советника вместе со всеми его разговорами?")) deleteAdvisor(id);
      }}
      className="btn-danger ml-auto"
    >
      Удалить советника
    </button>
  );
}
