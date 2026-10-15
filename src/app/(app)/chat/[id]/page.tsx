import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { advisors, conversations, db, messages } from "@/db";
import { ChatLayout } from "@/components/ChatLayout";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) notFound();
  const [advisor] = await db.select().from(advisors).where(eq(advisors.id, conv.advisorId));
  const history = await db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt), asc(messages.id));
  return <ChatLayout advisor={advisor} conversationId={id} initialMessages={history} />;
}
