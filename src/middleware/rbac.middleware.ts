import { Elysia } from "elysia";
import { authMiddleware } from "./auth.middleware";

type Role = "superadmin" | "admin" | "user";
export const rbacMiddleware = (allowedRoles: Role[]) => {
  return new Elysia()
    .use(authMiddleware)
    .onBeforeHandle({ as: "scoped" }, ({ user, set }) => {
      if (!user) {
        set.status = 401;
        return {
          success: false,
          error: "Authentication required",
        };
      }

      if (!allowedRoles.includes(user.role as Role)) {
        set.status = 403;
        return {
          success: false,
          error:
            "Insufficient permissions. This action requires elevated privileges.",
        };
      }
    });
};

export const requireSuperAdmin = () => rbacMiddleware(["superadmin"]);
export const requireAdmin = () => rbacMiddleware(["admin", "superadmin"]);
export const requireUser = () =>
  rbacMiddleware(["user", "admin", "superadmin"]);
