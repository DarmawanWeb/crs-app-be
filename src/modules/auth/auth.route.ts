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
        body: AuthModel.refreshTokenBody,
        response: {
          200: ResponseSuccess(AuthModel.refreshTokenResponse),
          401: ResponseError,
          500: ResponseError,
        },
      },
    );

    return auth;
  });
