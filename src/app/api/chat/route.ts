import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { advisors, conversations, db, messages } from "@/db";
import { describeError, streamReply } from "@/lib/claude";
import { buildOwnerContext, buildSystemPrompt } from "@/lib/context";
import { ndjsonResponse } from "@/lib/ndjson";

export const maxDuration = 300;

const Body = z.object({
  advisorSlug: z.string().min(1),
  conversationId: z.string().uuid().nullish(),
  message: z.string().trim().min(1).max(20000),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const { advisorSlug, message } = parsed.data;

  const [advisor] = await db.select().from(advisors).where(eq(advisors.slug, advisorSlug));
  if (!advisor) return NextResponse.json({ error: "Советник не найден" }, { status: 404 });

  let conversationId = parsed.data.conversationId ?? null;
  if (conversationId) {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    if (!conv || conv.advisorId !== advisor.id) {
      return NextResponse.json({ error: "Разговор не найден" }, { status: 404 });
    }
  } else {
    const title = message.length > 60 ? message.slice(0, 57) + "…" : message;
    const [conv] = await db.insert(conversations).values({ advisorId: advisor.id, title }).returning();
    conversationId = conv.id;
  }

  await db.insert(messages).values({ conversationId, role: "user", content: message });
  const history = await db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt), asc(messages.id));

  const system = buildSystemPrompt(advisor, await buildOwnerContext());
  const convId = conversationId;

  return ndjsonResponse(
    async (send, signal) => {
      send({ type: "start", conversationId: convId });
      try {
        const text = await streamReply({
          system,
          messages: history,
          onText: (delta) => send({ type: "delta", text: delta }),
          signal,
        });
        await db.insert(messages).values({ conversationId: convId, role: "assistant", content: text });
        await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, convId));
        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: describeError(err) });
      }
    },
    { "X-Conversation-Id": convId },
  );
}
