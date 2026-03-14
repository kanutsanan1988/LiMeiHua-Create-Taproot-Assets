/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 */

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  lightningAddress: varchar("lightningAddress", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Taproot Assets tokens created by users.
 */
export const tokens = mysqlTable("tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Full name of the token */
  name: varchar("name", { length: 255 }).notNull(),
  /** Short symbol/ticker (e.g. BTC, USDT) */
  symbol: varchar("symbol", { length: 32 }).notNull(),
  /** Initial supply amount as string to handle large numbers */
  initialSupply: varchar("initialSupply", { length: 78 }).notNull(),
  /** Current circulating supply */
  currentSupply: varchar("currentSupply", { length: 78 }).notNull(),
  /** Number of decimal places */
  decimals: int("decimals").notNull().default(8),
  /** Token type: fixed, mintable, burnable */
  tokenType: mysqlEnum("tokenType", ["fixed", "mintable", "burnable"]).notNull(),
  /** Owner's Bitcoin/Lightning address */
  ownerAddress: varchar("ownerAddress", { length: 512 }).notNull(),
  /** Taproot Asset ID returned from the protocol */
  assetId: varchar("assetId", { length: 128 }),
  /** Batch transaction key */
  batchTxid: varchar("batchTxid", { length: 128 }),
  /** Asset group key for mintable assets */
  groupKey: varchar("groupKey", { length: 256 }),
  /** Estimated gas/fee in satoshis */
  estimatedFee: int("estimatedFee"),
  /** Actual fee paid in satoshis */
  actualFee: int("actualFee"),
  /** Status of the token creation */
  status: mysqlEnum("status", ["pending", "minting", "confirmed", "failed"]).default("pending").notNull(),
  /** Optional metadata JSON */
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Token = typeof tokens.$inferSelect;
export type InsertToken = typeof tokens.$inferInsert;

/**
 * Transaction log for token operations (mint, burn, transfer).
 */
export const tokenTransactions = mysqlTable("token_transactions", {
  id: int("id").autoincrement().primaryKey(),
  tokenId: int("tokenId").notNull(),
  userId: int("userId").notNull(),
  /** Type of transaction */
  txType: mysqlEnum("txType", ["mint", "burn", "transfer", "create"]).notNull(),
  /** Amount involved in the transaction */
  amount: varchar("amount", { length: 78 }).notNull(),
  /** Transaction hash on-chain */
  txHash: varchar("txHash", { length: 128 }),
  /** Fee paid in satoshis */
  fee: int("fee"),
  /** Status of the transaction */
  status: mysqlEnum("txStatus", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  /** Additional notes or error messages */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;
