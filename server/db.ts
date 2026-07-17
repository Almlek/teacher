import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, lessonPlans, libraryBooks, userSettings, InsertLessonPlan, InsertLibraryBook, InsertUserSettings } from "../drizzle/schema";
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
