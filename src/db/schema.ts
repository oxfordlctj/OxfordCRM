import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const advisors = pgTable("advisors", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull().$type<"business" | "life">(),
  emoji: text("emoji").notNull().default("🎓"),
  description: text("description").notNull().default(""),
  persona: text("persona").notNull(),
  isChair: boolean("is_chair").notNull().default(false),
  enabled: boolean("enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(100),
});

export const dossierSections = pgTable("dossier_sections", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  hint: text("hint").notNull().default(""),
  content: text("content").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(100),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memoryFacts = pgTable("memory_facts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  category: text("category").notNull().default("other"),
  source: text("source").notNull().default("manual"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  advisorId: integer("advisor_id")
    .notNull()
    .references(() => advisors.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Новый разговор"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull().$type<"user" | "assistant">(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MeetingStatus = "pending" | "running" | "done" | "error";

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  context: text("context").notNull().default(""),
  mode: text("mode").notNull().$type<"express" | "full">().default("full"),
  participantIds: jsonb("participant_ids").notNull().$type<number[]>(),
  status: text("status").notNull().$type<MeetingStatus>().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** round: 1 — позиции, 2 — дебаты, 3 — итог председателя */
export const meetingTurns = pgTable("meeting_turns", {
  id: serial("id").primaryKey(),
  meetingId: uuid("meeting_id")
    .notNull()
    .references(() => meetings.id, { onDelete: "cascade" }),
  advisorId: integer("advisor_id").references(() => advisors.id, { onDelete: "set null" }),
  round: integer("round").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DecisionStatus = "active" | "done" | "cancelled";

export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  meetingId: uuid("meeting_id").references(() => meetings.id, { onDelete: "set null" }),
  status: text("status").notNull().$type<DecisionStatus>().default("active"),
  reviewDate: date("review_date"),
  outcome: text("outcome").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  decisionId: integer("decision_id").references(() => decisions.id, { onDelete: "cascade" }),
  advisorId: integer("advisor_id").references(() => advisors.id, { onDelete: "set null" }),
  dueDate: date("due_date"),
  status: text("status").notNull().$type<"open" | "done">().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  doneAt: timestamp("done_at", { withTimezone: true }),
});

export type Advisor = typeof advisors.$inferSelect;
export type DossierSection = typeof dossierSections.$inferSelect;
export type MemoryFact = typeof memoryFacts.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type MeetingTurn = typeof meetingTurns.$inferSelect;
export type Decision = typeof decisions.$inferSelect;
export type Task = typeof tasks.$inferSelect;
