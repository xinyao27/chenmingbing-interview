import { serial, text, timestamp, pgTable } from "drizzle-orm/pg-core";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  role: text("role").notNull(), // 简化为 text，可在应用层验证
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }) // 使用 timestamp
    .notNull()
    .defaultNow(),
});

export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
