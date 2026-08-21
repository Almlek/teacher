import { and, desc, eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, lessonPlans, libraryBooks, userSettings, exams, examQuestions, examVersions, questionBank, InsertLessonPlan, InsertLibraryBook, InsertUserSettings, InsertExam, InsertExamQuestion, InsertExamVersion, InsertQuestionBankItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Lesson Plans queries
export async function createLessonPlan(plan: InsertLessonPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lessonPlans).values(plan);
  return result;
}

export async function getLessonPlansByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(lessonPlans).where(eq(lessonPlans.userId, userId));
}

export async function getLessonPlanById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(lessonPlans)
    .where(and(eq(lessonPlans.id, id), eq(lessonPlans.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLessonPlan(id: number, userId: number, updates: Partial<InsertLessonPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateObj: any = {};
  Object.keys(updates).forEach(key => {
    updateObj[key] = (updates as any)[key];
  });
  return await db
    .update(lessonPlans)
    .set(updateObj)
    .where(and(eq(lessonPlans.id, id), eq(lessonPlans.userId, userId)));
}

export async function deleteLessonPlan(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .delete(lessonPlans)
    .where(and(eq(lessonPlans.id, id), eq(lessonPlans.userId, userId)));
}

// Exams and questions queries
export async function getExamsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(exams).where(eq(exams.userId, userId));
}

export async function createExam(exam: InsertExam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(exams).values(exam);
  const rawResult = result as unknown as { insertId?: number };
  const insertId = Number(rawResult.insertId ?? 0);
  if (insertId > 0) return { id: insertId };
  const latest = await db.select({ id: exams.id }).from(exams).where(eq(exams.userId, exam.userId)).orderBy(desc(exams.id)).limit(1);
  return { id: latest[0]?.id ?? 0 };
}

export async function getExamById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(exams).where(and(eq(exams.id, id), eq(exams.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateExam(id: number, userId: number, updates: Partial<InsertExam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(exams).set(updates as any).where(and(eq(exams.id, id), eq(exams.userId, userId)));
}

export async function deleteExam(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(exams).where(and(eq(exams.id, id), eq(exams.userId, userId)));
}

export async function getExamQuestions(examId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(examQuestions).where(eq(examQuestions.examId, examId));
}

export async function createExamQuestion(question: InsertExamQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(examQuestions).values(question);
}

export async function deleteExamQuestions(examId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(examQuestions).where(eq(examQuestions.examId, examId));
}

export async function deleteExamQuestion(id: number, examId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(examQuestions).where(and(eq(examQuestions.id, id), eq(examQuestions.examId, examId)));
}

// Exam Versions & Auto-save queries
export async function getExamVersions(examId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(examVersions).where(and(eq(examVersions.examId, examId), eq(examVersions.userId, userId))).orderBy(desc(examVersions.versionNumber));
}

export async function createExamVersion(version: InsertExamVersion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const latest = await db.select({ versionNumber: examVersions.versionNumber }).from(examVersions).where(eq(examVersions.examId, version.examId)).orderBy(desc(examVersions.versionNumber)).limit(1);
  const nextVersion = (latest[0]?.versionNumber ?? 0) + 1;
  return await db.insert(examVersions).values({ ...version, versionNumber: nextVersion });
}

// Question Bank queries
export async function getQuestionBankByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(questionBank).where(eq(questionBank.userId, userId)).orderBy(desc(questionBank.id));
}

export async function searchQuestionBank(userId: number, filters: { query?: string; subject?: string; grade?: string; questionType?: string; difficulty?: string; tag?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(questionBank.userId, userId)];
  if (filters.query?.trim()) conditions.push(like(questionBank.prompt, `%${filters.query.trim()}%`));
  if (filters.subject) conditions.push(eq(questionBank.subject, filters.subject));
  if (filters.grade) conditions.push(eq(questionBank.grade, filters.grade));
  if (filters.questionType) conditions.push(eq(questionBank.questionType, filters.questionType));
  if (filters.difficulty) conditions.push(eq(questionBank.difficulty, filters.difficulty));
  if (filters.tag?.trim()) conditions.push(like(questionBank.tags, `%${filters.tag.trim()}%`));
  return await db.select().from(questionBank).where(and(...conditions)).orderBy(desc(questionBank.id));
}

export async function createQuestionBankItem(item: InsertQuestionBankItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(questionBank).values(item);
}

export async function deleteQuestionBankItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(questionBank).where(and(eq(questionBank.id, id), eq(questionBank.userId, userId)));
}

// Library Books queries
export async function addLibraryBook(book: InsertLibraryBook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(libraryBooks).values(book);
}

export async function getLibraryBooksByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(libraryBooks).where(eq(libraryBooks.userId, userId));
}

export async function deleteLibraryBook(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .delete(libraryBooks)
    .where(and(eq(libraryBooks.id, id), eq(libraryBooks.userId, userId)));
}

// User Settings queries
export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteAllUserData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(questionBank).where(eq(questionBank.userId, userId));
  await db.delete(examVersions).where(eq(examVersions.userId, userId));
  await db.delete(exams).where(eq(exams.userId, userId));
  await db.delete(lessonPlans).where(eq(lessonPlans.userId, userId));
  await db.delete(libraryBooks).where(eq(libraryBooks.userId, userId));
  await db.delete(userSettings).where(eq(userSettings.userId, userId));
  return { success: true } as const;
}

export async function upsertUserSettings(userId: number, settings: Partial<Omit<InsertUserSettings, 'userId'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserSettings(userId);
  const settingsObj: any = {};
  Object.keys(settings).forEach(key => {
    settingsObj[key] = (settings as any)[key];
  });
  if (existing) {
    return await db.update(userSettings).set(settingsObj).where(eq(userSettings.userId, userId));
  } else {
    const fullSettings: InsertUserSettings = { userId, ...settingsObj } as InsertUserSettings;
    return await db.insert(userSettings).values(fullSettings);
  }
}
