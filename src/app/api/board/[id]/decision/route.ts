import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { advisors, db, meetings, meetingTurns } from "@/db";
import { describeError, generateJson } from "@/lib/claude";
import { todayInDushanbe } from "@/lib/context";
import type { DecisionDraft } from "@/lib/types";

export const maxDuration = 300;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
  if (!meeting || meeting.status !== "done") {
    return NextResponse.json({ error: "Заседание ещё не завершено" }, { status: 400 });
  }
  const turns = await db
    .select({ round: meetingTurns.round, content: meetingTurns.content, name: advisors.name })
    .from(meetingTurns)
    .leftJoin(advisors, eq(meetingTurns.advisorId, advisors.id))
    .where(eq(meetingTurns.meetingId, id))
    .orderBy(asc(meetingTurns.round), asc(meetingTurns.id));
  const summary = turns.find((t) => t.round === 3)?.content ?? turns.map((t) => `${t.name}: ${t.content}`).join("\n\n");

  const slugs = (await db.select({ slug: advisors.slug }).from(advisors)).map((a) => a.slug);

  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["title", "description", "review_in_days", "tasks"],
    properties: {
      title: { type: "string", description: "Краткая формулировка решения, до 100 символов" },
      description: { type: "string", description: "Суть решения и ключевые условия, 2–4 предложения" },
      review_in_days: { type: "integer", description: "Через сколько дней пересмотреть результат" },
      tasks: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "owner_slug", "due_in_days"],
          properties: {
            title: { type: "string", description: "Конкретное действие" },
            owner_slug: { type: "string", enum: slugs, description: "Советник, курирующий задачу" },
            due_in_days: { type: "integer", description: "Срок в днях от сегодня" },
          },
        },
      },
    },
  };

  try {
    const draft = await generateJson<DecisionDraft>({
      system: `Ты — секретарь совета директоров. Превращаешь итог заседания в формальное решение и список поручений владельцу. Пиши по-русски. Сегодня: ${todayInDushanbe()}.`,
      prompt: `Вопрос заседания: ${meeting.question}\n\nИтог заседания:\n${summary}\n\nСформулируй решение и 2–7 конкретных поручений из плана действий.`,
      schema,
      mock: {
        title: `Решение: ${meeting.question.slice(0, 80)}`,
        description: "Тестовое решение (CLAUDE_MOCK=1).",
        review_in_days: 30,
        tasks: [
          { title: "Собрать данные по филиалам", owner_slug: "cfo", due_in_days: 7 },
          { title: "Подготовить план запуска", owner_slug: "coo", due_in_days: 14 },
        ],
      },
    });
    return NextResponse.json(draft);
  } catch (err) {
    return NextResponse.json({ error: describeError(err) }, { status: 500 });
  }
}
