import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, dossierSections, memoryFacts, messages } from "@/db";
import { describeError, generateJson } from "@/lib/claude";

export const maxDuration = 300;

const Body = z.object({ conversationId: z.string().uuid() });

export type ExtractedFacts = { facts: { content: string; category: string }[] };

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, parsed.data.conversationId))
    .orderBy(asc(messages.createdAt), asc(messages.id));
  if (!history.length) return NextResponse.json({ facts: [] });

  const [sections, known] = await Promise.all([
    db.select({ key: dossierSections.key, title: dossierSections.title }).from(dossierSections),
    db.select({ content: memoryFacts.content }).from(memoryFacts),
  ]);
  const categories = [...sections.map((s) => s.key), "other"];

  const transcript = history
    .map((m) => `${m.role === "user" ? "Владелец" : "Советник"}: ${m.content}`)
    .join("\n\n");

  try {
    const result = await generateJson<ExtractedFacts>({
      system:
        "Ты ведёшь память личного совета директоров. Из разговора извлекаешь только новые устойчивые факты о владельце, его бизнесе, целях, решениях, здоровье, финансах и семье — то, что пригодится советникам в будущих разговорах. Только то, что сказал сам владелец, а не советы советника. Каждый факт — одно самодостаточное предложение на русском. Не дублируй уже известные факты.",
      prompt: `Категории: ${sections.map((s) => `${s.key} (${s.title})`).join(", ")}, other (другое).\n\nУже известно:\n${known.map((k) => `- ${k.content}`).join("\n") || "(пока ничего)"}\n\nРазговор:\n${transcript}`,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["facts"],
        properties: {
          facts: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["content", "category"],
              properties: {
                content: { type: "string" },
                category: { type: "string", enum: categories },
              },
            },
          },
        },
      },
      effort: "low",
      mock: { facts: [{ content: "Тестовый факт из разговора (CLAUDE_MOCK=1).", category: "business" }] },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: describeError(err) }, { status: 500 });
  }
}
