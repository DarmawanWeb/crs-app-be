import {
  pgTable,
  pgEnum,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
  text,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

// ===== ENUMS =====
export const role = pgEnum("role", ["superadmin", "admin", "user"]);
export const status = pgEnum("status", ["accepted", "to_be_review"]);

// ===== USER TABLE =====
export const user = pgTable("user", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  fullname: varchar().notNull(),
  email: varchar().unique().notNull(),
  password: varchar().notNull(),
  role: role().default("user"),
  created_at: timestamp().defaultNow().notNull(),
});

// ===== DOCUMENT TABLE =====
export const document = pgTable("document", {
  number: varchar().primaryKey(),
  title: varchar().notNull(),
  availability: boolean().notNull(),
  file_path: varchar().notNull(),
  project: varchar().notNull(),
  discipline: varchar().notNull(),
  wp: varchar().notNull(),
  lookup: varchar().notNull(),
  created_at: timestamp().defaultNow().notNull(),
});

// ===== COMMENT TABLE =====
export const comment = pgTable("comment", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  document_number: varchar("document_number")
    .references(() => document.number)
    .notNull(),
  user_id: uuid("user_id")
    .references(() => user.id)
    .notNull(),
  section: integer().notNull(),
  comments: text().notNull(),
  reff: varchar(),
  company_response: text(),
  stage_affected_in_project: varchar(),
  status: status().default("to_be_review").notNull(),
  created_at: timestamp().defaultNow().notNull(),
});

// ===== BLACKLISTED TOKEN TABLE =====
export const blacklisted_tokens = pgTable("blacklisted_tokens", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  token_hash: varchar().unique().notNull(),
  user_id: uuid("user_id").references(() => user.id),
  invalidated_at: timestamp().defaultNow().notNull(),
  expires_at: timestamp().notNull(),
  created_at: timestamp().defaultNow().notNull(),
});
