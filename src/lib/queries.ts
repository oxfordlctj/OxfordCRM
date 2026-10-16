import { asc, eq, sql } from "drizzle-orm";
import { advisors, db, decisions, tasks } from "@/db";

/** Поручения с именем куратора и названием решения */
export async function listTasks(onlyOpen: boolean) {
  const q = db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      dueDate: tasks.dueDate,
      decisionId: tasks.decisionId,
      advisorEmoji: advisors.emoji,
      advisorName: advisors.name,
      decisionTitle: decisions.title,
    })
    .from(tasks)
    .leftJoin(advisors, eq(tasks.advisorId, advisors.id))
    .leftJoin(decisions, eq(tasks.decisionId, decisions.id))
    .orderBy(sql`${tasks.dueDate} asc nulls last`, asc(tasks.id));
  return onlyOpen ? q.where(eq(tasks.status, "open")) : q;
}
