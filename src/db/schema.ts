import { pgTable, pgEnum, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const role = pgEnum("role", ["superadmin", "admin", "user"]);

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
