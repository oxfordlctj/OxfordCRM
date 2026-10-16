"use client";

import { useOptimistic, useTransition } from "react";
import { deleteTask, toggleTask } from "@/lib/actions";
import { formatDate, isOverdue } from "@/lib/dates";

export type TaskView = {
  id: number;
  title: string;
  status: "open" | "done";
  dueDate: string | null;
  advisorEmoji?: string | null;
  advisorName?: string | null;
  decisionTitle?: string | null;
};

export function TaskItem({ task, showDecision = false }: { task: TaskView; showDecision?: boolean }) {
  const [, startTransition] = useTransition();
  const [done, setDone] = useOptimistic(task.status === "done");
  const overdue = !done && isOverdue(task.dueDate);
  return (
    <div className="group flex items-start gap-3 py-2">
      <input
        type="checkbox"
        checked={done}
        onChange={(e) => {
          const next = e.target.checked;
          startTransition(async () => {
            setDone(next);
            await toggleTask(task.id, next);
          });
        }}
        className="mt-1 h-4 w-4 shrink-0 accent-ink-900"
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${done ? "text-ink-400 line-through" : "text-ink-900"}`}>{task.title}</p>
        <p className="flex flex-wrap gap-x-3 text-xs text-ink-400">
          {task.dueDate && (
            <span className={overdue ? "font-medium text-red-600" : ""}>
              {overdue ? "просрочено: " : "до "}
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.advisorName && <span>{task.advisorEmoji} {task.advisorName}</span>}
          {showDecision && task.decisionTitle && <span className="truncate">↳ {task.decisionTitle}</span>}
        </p>
      </div>
      <button
        onClick={() => {
          if (confirm("Удалить поручение?")) startTransition(() => deleteTask(task.id));
        }}
        className="text-xs text-ink-300 opacity-0 group-hover:opacity-100 hover:text-red-600 max-md:opacity-100"
        title="Удалить"
      >
        ✕
      </button>
    </div>
  );
}
