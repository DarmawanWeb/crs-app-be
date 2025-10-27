import { eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { user, blacklisted_tokens } from "../../db/schema";
import { registerBody } from "./auth.model";
import { createHash } from "crypto";

export const AuthRepository = {
  getUserByEmail: async (email: string) => {
    try {
      const response = await db
        .select()
        .from(user)
        .where(eq(sql`lower(${user.email})`, email.toLowerCase()))
        .limit(1);
      return { error: null, data: response?.[0] };
    } catch {
      return { error: "Failed to get user" };
    }
  },
  createUser: async (data: registerBody) => {
    try {
      const result = await db.insert(user).values(data).returning({
        id: user.id,
      });

      return { error: null, data: result?.[0] };
    } catch {
      return { error: "Failed to create user" };
    }
  },
  invalidateRefreshToken: async (token: string, userId?: string) => {
    try {
      const tokenHash = createHash("sha256").update(token).digest("hex");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.insert(blacklisted_tokens).values({
        token_hash: tokenHash,
        user_id: userId,
        expires_at: expiresAt,
      });

      return { error: null, data: true };
    } catch {
      return { error: "Failed to invalidate token" };
    }
  },
  isTokenBlacklisted: async (token: string) => {
    try {
      const tokenHash = createHash("sha256").update(token).digest("hex");

      const result = await db
        .select()
        .from(blacklisted_tokens)
        .where(eq(blacklisted_tokens.token_hash, tokenHash))
        .limit(1);

      return { error: null, data: result.length > 0 };
    } catch {
      return { error: "Failed to check token blacklist" };
    }
  },
};
