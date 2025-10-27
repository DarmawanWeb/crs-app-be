import { Elysia } from "elysia";
import { AuthModel } from "./auth.model";
import { ResponseError, ResponseSuccess } from "../../lib/response";
import { AuthService } from "./auth.service";
import { authMiddleware } from "../../middleware/auth.middleware";

export const AuthRoutes = (app: Elysia) =>
  app.group("/auth", (auth) => {
    auth.post(
      "/login",
      async ({ body, set }) => {
        const { data, error, statusCode } = await AuthService.login(body);

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error: error,
          };
        }

        set.status = statusCode || 200;
        return {
          success: true,
          data: data,
        };
      },
      {
        tags: ["Authentication"],
        detail: {
          summary: "User Login",
          description:
            "Authenticate a user with email and password. Returns access token and refresh token upon successful authentication.",
        },
        body: AuthModel.loginBody,
        response: {
          200: ResponseSuccess(AuthModel.loginResponse),
          401: ResponseError,
          500: ResponseError,
        },
      },
    );

    auth.post(
      "/register",
      async ({ body, set }) => {
        const { data, error, statusCode } = await AuthService.register(body);

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error: error,
          };
        }

        set.status = statusCode || 201;
        return {
          success: true,
          data: data,
        };
      },
      {
        tags: ["Authentication"],
        detail: {
          summary: "User Registration",
          description:
            "Register a new user account. Creates a new user with the provided credentials and returns authentication tokens.",
        },
        body: AuthModel.registerBody,
        response: {
          201: ResponseSuccess(AuthModel.registerResponse),
          500: ResponseError,
        },
      },
    );

    auth.use(authMiddleware).get(
      "/me",
      async ({ user, set }) => {
        set.status = 200;
        return {
          success: true,
          data: user,
        };
      },
      {
        tags: ["Authentication"],
        detail: {
          summary: "Get Current User",
          description:
            "Retrieve the authenticated user's profile information. Requires a valid access token in the Authorization header.",
        },
        response: {
          200: ResponseSuccess(AuthModel.meResponse),
          401: ResponseError,
          500: ResponseError,
        },
      },
    );

    auth.post(
      "/refresh-token",
      async ({ body, set }) => {
        const { data, error, statusCode } = await AuthService.refreshToken(
          body.refresh_token,
        );

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error: error,
          };
        }

        set.status = statusCode || 200;
        return {
          success: true,
          data: data,
        };
      },
      {
        tags: ["Authentication"],
        detail: {
          summary: "Refresh Access Token",
          description:
            "Generate a new access token using a valid refresh token. Use this endpoint when the access token has expired to obtain a new one without requiring the user to log in again.",
        },
        body: AuthModel.refreshTokenBody,
        response: {
          200: ResponseSuccess(AuthModel.refreshTokenResponse),
          401: ResponseError,
          500: ResponseError,
        },
      },
    );

    auth.use(authMiddleware).post(
      "/logout",
      async ({ body, headers, set }) => {
        const authHeader = headers.authorization;
        const accessToken = authHeader?.split(" ")[1] || "";

        const { error, statusCode } = await AuthService.logout(
          body.refresh_token,
          accessToken,
        );

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error: error,
          };
        }

        set.status = statusCode || 200;
        return {
          success: true,
          data: { message: "Logged out successfully" },
        };
      },
      {
        tags: ["Authentication"],
        detail: {
          summary: "User Logout",
          description:
            "Log out the current user by invalidating their access token and refresh token. Requires authentication. After logout, both tokens will be revoked and cannot be used for further requests.",
        },
        body: AuthModel.logoutBody,
        response: {
          200: ResponseSuccess(AuthModel.logoutResponse),
          401: ResponseError,
          500: ResponseError,
        },
      },
    );

    return auth;
  });
