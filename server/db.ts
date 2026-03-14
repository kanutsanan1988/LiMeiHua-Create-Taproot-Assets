/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 */

import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  tokens,
  tokenTransactions,
  InsertToken,
  InsertTokenTransaction,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

// ─── User Helpers ──────────────────────────────────────────────────────────────

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
    const values: InsertUser = { openId: user.openId };
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
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Token Helpers ─────────────────────────────────────────────────────────────

export async function createToken(data: InsertToken) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tokens).values(data);
  const insertId = result[0].insertId;
  const rows = await db.select().from(tokens).where(eq(tokens.id, insertId)).limit(1);
  return rows[0];
}

export async function getTokensByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(tokens).where(eq(tokens.userId, userId)).orderBy(desc(tokens.createdAt));
}

export async function getTokenById(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(tokens).where(eq(tokens.id, tokenId)).limit(1);
  return rows[0] ?? null;
}

export async function updateTokenStatus(tokenId: number, status: "pending" | "minting" | "confirmed" | "failed", extra?: Partial<InsertToken>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tokens).set({ status, ...extra }).where(eq(tokens.id, tokenId));
}

export async function updateTokenSupply(tokenId: number, newSupply: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tokens).set({ currentSupply: newSupply }).where(eq(tokens.id, tokenId));
}

// ─── Token Transaction Helpers ─────────────────────────────────────────────────

export async function createTokenTransaction(data: InsertTokenTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tokenTransactions).values(data);
  const insertId = result[0].insertId;
  const rows = await db.select().from(tokenTransactions).where(eq(tokenTransactions.id, insertId)).limit(1);
  return rows[0];
}

export async function getTransactionsByToken(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.tokenId, tokenId))
    .orderBy(desc(tokenTransactions.createdAt));
}

export async function getTransactionsByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId))
    .orderBy(desc(tokenTransactions.createdAt));
}
