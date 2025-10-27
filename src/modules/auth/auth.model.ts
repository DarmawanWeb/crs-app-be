import { t } from "elysia";

export const AuthModel = {
  loginBody: t.Object({
    email: t.String({ format: "email" }),
    password: t.String(),
  }),
  loginResponse: t.Object({
    user: t.Object({
      id: t.String(),
      fullname: t.String(),
      email: t.String(),
      role: t.String(),
    }),
    access_token: t.String(),
    refresh_token: t.String(),
  }),
  registerBody: t.Object({
    fullname: t.String(),
    email: t.String({ format: "email" }),
    password: t.String({
      minLength: 8,
      description: "Password must be at least 8 characters long",
    }),
  }),
  registerResponse: t.Object({
    id: t.String(),
    fullname: t.String(),
    email: t.String(),
  }),
  meResponse: t.Object({
    id: t.String(),
    fullname: t.String(),
    email: t.String(),
    role: t.String(),
  }),
  refreshTokenBody: t.Object({
    refresh_token: t.String(),
  }),
  refreshTokenResponse: t.Object({
    access_token: t.String(),
    refresh_token: t.String(),
  }),
  logoutBody: t.Object({
    refresh_token: t.String(),
  }),
  logoutResponse: t.Object({
    message: t.String(),
  }),
} as const;

export type loginBody = typeof AuthModel.loginBody.static;
export type registerBody = typeof AuthModel.registerBody.static;
export type registerResponse = typeof AuthModel.registerResponse.static;
export type loginResponse = typeof AuthModel.loginResponse.static;
export type logoutBody = typeof AuthModel.logoutBody.static;
