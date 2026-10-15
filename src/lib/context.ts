import { asc, desc, eq } from "drizzle-orm";
import { advisors, db, decisions, dossierSections, memoryFacts, tasks, type Advisor } from "@/db";

const BASE_RULES = `Ты — член личного совета директоров владельца бизнеса. Совет — это команда ИИ-советников, каждый со своей экспертизой. Владелец обращается к вам за советом по бизнесу и по всем сферам жизни.

Общие правила для всех советников:
- Отвечай на русском языке, обращайся к владельцу на «вы».
- Будь конкретным: цифры, шаги, сроки, примеры формулировок. Без общих слов и воды.
- Опирайся на досье и память ниже. Не выдумывай факты о бизнесе владельца: если чего-то не знаешь — прямо скажи, сделай явное допущение или задай 1–2 уточняющих вопроса, но всё равно дай лучший возможный ответ.
- Контекст: Таджикистан, Душанбе. Валюта — сомони (TJS); при необходимости указывай эквивалент в долларах.
- Если вопрос лучше решит другой советник совета — скажи, к кому обратиться.
- Говори честно, даже если это неприятно. Ты работаешь на интересы владельца, а не на его одобрение.
- Используй Markdown: короткие абзацы, списки, при необходимости таблицы.`;

/** Общий контекст владельца: досье, память, открытые решения и поручения. */
export async function buildOwnerContext() {
  const [sections, facts, openDecisions, openTasks] = await Promise.all([
    db.select().from(dossierSections).orderBy(asc(dossierSections.sortOrder)),
    db.select().from(memoryFacts).orderBy(asc(memoryFacts.createdAt)),
    db.select().from(decisions).where(eq(decisions.status, "active")).orderBy(desc(decisions.createdAt)).limit(10),
    db.select().from(tasks).where(eq(tasks.status, "open")).orderBy(asc(tasks.dueDate)).limit(15),
  ]);

  const parts: string[] = ["# Досье владельца"];
  for (const s of sections) {
    if (s.content.trim()) parts.push(`## ${s.title}\n${s.content.trim()}`);
  }
  if (facts.length) {
    parts.push("# Память (факты из прошлых разговоров)");
    parts.push(facts.map((f) => `- ${f.content}`).join("\n"));
  }
  if (openDecisions.length) {
    parts.push("# Действующие решения совета");
    parts.push(openDecisions.map((d) => `- ${d.title}${d.description ? `: ${d.description}` : ""}`).join("\n"));
  }
  if (openTasks.length) {
    parts.push("# Открытые поручения");
    parts.push(openTasks.map((t) => `- ${t.title}${t.dueDate ? ` (срок: ${t.dueDate})` : ""}`).join("\n"));
  }
  return parts.join("\n\n");
}

export function todayInDushanbe() {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Dushanbe",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

/**
 * Системный промпт советника. Порядок: общие правила и контекст владельца (одинаковы
 * для всех советников) → роль → дата, чтобы стабильная часть шла первой.
 */
export function buildSystemPrompt(advisor: Advisor, ownerContext: string, extra?: string) {
  return [
    BASE_RULES,
    ownerContext,
    `# Твоя роль: ${advisor.name} — ${advisor.title}\n${advisor.persona}`,
    extra ?? "",
    `Сегодня: ${todayInDushanbe()}.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function getChair() {
  const [chair] = await db.select().from(advisors).where(eq(advisors.isChair, true)).limit(1);
  return chair;
}
