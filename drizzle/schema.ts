import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lesson Plans Table
 * Stores all lesson plans created by users
 */
export const lessonPlans = mysqlTable("lesson_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  school: varchar("school", { length: 255 }),
  teacher: varchar("teacher", { length: 255 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 100 }),
  section: varchar("section", { length: 50 }),
  date: varchar("date", { length: 50 }),
  period: varchar("period", { length: 100 }),
  title: varchar("title", { length: 500 }).notNull(),
  language: varchar("language", { length: 10 }).default("ar"),
  contentSource: varchar("contentSource", { length: 50 }).default("title"),
  aiModel: varchar("aiModel", { length: 100 }).default("gemini-1.5-flash"),
  content: text("content"),
  boardContent: text("boardContent"),
  audioContent: text("audioContent"),
  summaryContent: text("summaryContent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonPlan = typeof lessonPlans.$inferSelect;
export type InsertLessonPlan = typeof lessonPlans.$inferInsert;

/**
 * Library Books Table
 * Stores PDF books uploaded by users for reference
 */
export const libraryBooks = mysqlTable("library_books", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 500 }),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 500 }),
  fileSize: int("fileSize"),
  subject: varchar("subject", { length: 255 }),
  grade: varchar("grade", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LibraryBook = typeof libraryBooks.$inferSelect;
export type InsertLibraryBook = typeof libraryBooks.$inferInsert;

/**
 * User Settings Table
 * Stores user preferences for themes, fonts, and defaults
 */
export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  theme: varchar("theme", { length: 50 }).default("purple"),
  fontSize: varchar("fontSize", { length: 20 }).default("medium"),
  fontFamily: varchar("fontFamily", { length: 100 }).default("cairo"),
  defaultLanguage: varchar("defaultLanguage", { length: 10 }).default("ar"),
  defaultModel: varchar("defaultModel", { length: 100 }).default("gemini-1.5-flash"),
  defaultSchool: varchar("defaultSchool", { length: 255 }),
  defaultTeacher: varchar("defaultTeacher", { length: 255 }),
  defaultDirectorate: varchar("defaultDirectorate", { length: 255 }),
  defaultSubject: varchar("defaultSubject", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;