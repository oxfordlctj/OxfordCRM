"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  advisors,
  conversations,
  db,
  decisions,
  dossierSections,
  meetings,
  memoryFacts,
  tasks,
  type DecisionStatus,
} from "@/db";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

// ── Досье и память ──────────────────────────────────────────────

export async function saveDossierSection(fd: FormData) {
  await db
    .update(dossierSections)
    .set({ content: str(fd, "content"), updatedAt: new Date() })
    .where(eq(dossierSections.key, str(fd, "key")));
  revalidatePath("/dossier");
  revalidatePath("/");
}

export async function addMemoryFact(fd: FormData) {
  const content = str(fd, "content");
  if (!content) return;
  await db.insert(memoryFacts).values({ content, category: str(fd, "category") || "other" });
  revalidatePath("/dossier");
}

export async function deleteMemoryFact(id: number) {
  await db.delete(memoryFacts).where(eq(memoryFacts.id, id));
  revalidatePath("/dossier");
}

export async function saveFacts(facts: { content: string; category: string }[], source: string) {
  const clean = facts.map((f) => ({ ...f, content: f.content.trim() })).filter((f) => f.content);
  if (clean.length) await db.insert(memoryFacts).values(clean.map((f) => ({ ...f, source })));
  revalidatePath("/dossier");
}

// ── Заседания ───────────────────────────────────────────────────

export async function createMeeting(fd: FormData) {
  const question = str(fd, "question");
  const participantIds = fd.getAll("participants").map(Number).filter(Number.isInteger);
  if (!question || !participantIds.length) return;
  const [meeting] = await db
    .insert(meetings)
    .values({
      question,
      context: str(fd, "context"),
      mode: str(fd, "mode") === "express" ? "express" : "full",
      participantIds,
    })
    .returning();
  redirect(`/board/${meeting.id}`);
}

export async function deleteMeeting(id: string) {
  await db.delete(meetings).where(eq(meetings.id, id));
  redirect("/board");
}

// ── Решения и поручения ─────────────────────────────────────────

const DecisionInput = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim(),
  meetingId: z.string().uuid().nullish(),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  tasks: z.array(
    z.object({
      title: z.string().trim().min(1),
      advisorId: z.number().int().nullish(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
    }),
  ),
});

export async function createDecision(input: z.infer<typeof DecisionInput>) {
  const data = DecisionInput.parse(input);
  const [decision] = await db
    .insert(decisions)
    .values({
      title: data.title,
      description: data.description,
      meetingId: data.meetingId ?? null,
      reviewDate: data.reviewDate ?? null,
    })
    .returning();
  if (data.tasks.length) {
    await db.insert(tasks).values(
      data.tasks.map((t) => ({
        title: t.title,
        advisorId: t.advisorId ?? null,
        dueDate: t.dueDate ?? null,
        decisionId: decision.id,
      })),
    );
  }
  revalidatePath("/decisions");
  revalidatePath("/");
  redirect("/decisions");
}

export async function quickDecision(fd: FormData) {
  const title = str(fd, "title");
  if (!title) return;
  await db.insert(decisions).values({
    title,
    description: str(fd, "description"),
    reviewDate: str(fd, "reviewDate") || null,
  });
  revalidatePath("/decisions");
}

export async function updateDecision(fd: FormData) {
  const id = Number(fd.get("id"));
  const status = str(fd, "status") as DecisionStatus;
  await db
    .update(decisions)
    .set({ status: ["active", "done", "cancelled"].includes(status) ? status : "active", outcome: str(fd, "outcome") })
    .where(eq(decisions.id, id));
  if (status !== "active") {
    // закрываем решение — закрываем и его открытые поручения
    await db
      .update(tasks)
      .set({ status: "done", doneAt: new Date() })
      .where(and(eq(tasks.decisionId, id), ne(tasks.status, "done")));
  }
  revalidatePath("/decisions");
  revalidatePath("/");
}

export async function deleteDecision(id: number) {
  await db.delete(decisions).where(eq(decisions.id, id));
  revalidatePath("/decisions");
  revalidatePath("/");
}

export async function addTask(fd: FormData) {
  const title = str(fd, "title");
  if (!title) return;
  const decisionId = Number(fd.get("decisionId")) || null;
  const advisorId = Number(fd.get("advisorId")) || null;
  await db.insert(tasks).values({ title, decisionId, advisorId, dueDate: str(fd, "dueDate") || null });
  revalidatePath("/decisions");
  revalidatePath("/");
}

export async function toggleTask(id: number, done: boolean) {
  await db
    .update(tasks)
    .set({ status: done ? "done" : "open", doneAt: done ? new Date() : null })
    .where(eq(tasks.id, id));
  revalidatePath("/decisions");
  revalidatePath("/");
}

export async function deleteTask(id: number) {
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/decisions");
  revalidatePath("/");
}

// ── Разговоры ───────────────────────────────────────────────────

export async function deleteConversation(id: string, advisorSlug: string) {
  await db.delete(conversations).where(eq(conversations.id, id));
  redirect(`/advisors/${advisorSlug}`);
}

// ── Советники ───────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9-]{2,40}$/;

export async function saveAdvisor(fd: FormData) {
  const id = Number(fd.get("id")) || null;
  const values = {
    name: str(fd, "name"),
    title: str(fd, "title"),
    emoji: str(fd, "emoji") || "🎓",
    description: str(fd, "description"),
    persona: str(fd, "persona"),
    category: (str(fd, "category") === "life" ? "life" : "business") as "business" | "life",
    enabled: fd.get("enabled") === "on",
  };
  if (!values.name || !values.persona) return;

  let slug: string;
  if (id) {
    const [row] = await db.update(advisors).set(values).where(eq(advisors.id, id)).returning();
    slug = row.slug;
  } else {
    slug = str(fd, "slug").toLowerCase();
    if (!SLUG_RE.test(slug)) slug = `advisor-${Date.now().toString(36)}`;
    const [row] = await db.insert(advisors).values({ ...values, slug, sortOrder: 200 }).returning();
    slug = row.slug;
  }
  revalidatePath("/advisors");
  redirect(`/advisors/${slug}`);
}

export async function deleteAdvisor(id: number) {
  await db.delete(advisors).where(and(eq(advisors.id, id), eq(advisors.isChair, false)));
  redirect("/advisors");
}
