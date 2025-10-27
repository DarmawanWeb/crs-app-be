import { verifyToken } from "../lib/jwt";
import { AuthRepository } from "../modules/auth/auth.repository";
import { Elysia } from "elysia";

export const authMiddleware = new Elysia()
  .derive({ as: "scoped" }, async (request) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader?.startsWith("Bearer ")) {
      return {
        user: undefined,
        error: "Authorization header is missing or malformed",
      };
    }

    const token = authHeader.split(" ")[1];
    const { payload, error } = verifyToken(token);

    if (error || !payload) {
      return {
        user: undefined,
        error: "Invalid token",
      };
    }

    const { data: user, error: userError } =
      await AuthRepository.getUserByEmail(payload.email);

    if (userError || !user) {
      return {
        user: undefined,
        error: "User not found",
      };
    }

    return {
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    };
  })
  .onBeforeHandle({ as: "scoped" }, (request) => {
    if (request.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: request.error,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!request.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  });
