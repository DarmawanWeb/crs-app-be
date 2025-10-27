import { comparePassword, hashPassword } from "../../lib/hash";
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
} from "../../lib/jwt";
import { loginBody, registerBody } from "./auth.model";
import { AuthRepository } from "./auth.repository";

export const AuthService = {
  login: async ({ email, password }: loginBody) => {
    try {
      const { data, error } = await AuthRepository.getUserByEmail(email);

      if (error) {
        return {
          error: "Unable to verify credentials. Please try again later",
          statusCode: 500,
        };
      }

      if (!data) {
        return {
          error: "Invalid email or password",
          statusCode: 401,
        };
      }

      const isPasswordMatch = await comparePassword(password, data.password);

      if (!isPasswordMatch) {
        return {
          error: "Invalid email or password",
          statusCode: 401,
        };
      }

      const accessToken = generateToken({
        userId: data.id,
        email: data.email ?? "",
      });
      const refreshToken = generateRefreshToken({
        userId: data.id,
        email: data.email,
      });

      return {
        data: {
          user: {
            id: data.id,
            fullname: data.fullname,
            email: data.email,
            role: data.role,
          },
          access_token: accessToken,
          refresh_token: refreshToken,
        },
        statusCode: 200,
      };
    } catch {
      return {
        error: "An unexpected error occurred. Please try again later",
        statusCode: 500,
      };
    }
  },
  register: async (body: registerBody) => {
    try {
      const { data, error } = await AuthRepository.getUserByEmail(body.email);
      if (error) {
        return {
          error: "Unable to verify credentials. Please try again later",
          statusCode: 500,
        };
      }

      if (data) {
        return {
          error: "Email is already taken",
          statusCode: 401,
        };
      }

      const hashedPassword = await hashPassword(body.password);

      const { error: userError, data: user } = await AuthRepository.createUser({
        ...body,
        password: hashedPassword,
      });

      if (userError) {
        return {
          error: "Unable to register. Please try again later",
          statusCode: 500,
        };
      }

      return {
        data: {
          id: user?.id,
          fullname: body.fullname,
          email: body.email,
        },
        statusCode: 201,
      };
    } catch {
      return {
        error: "An unexpected error occurred. Please try again later",
        statusCode: 500,
      };
    }
  },
  me: async (token: string) => {
    try {
      const result = verifyToken(token);

      if (result.error) {
        return {
          statusCode: 401,
          error: result.error,
        };
      }

      const { data, error } = await AuthRepository.getUserByEmail(
        result.payload?.email || "",
      );

      if (error) {
        return {
          error: "Unable to verify credentials. Please try again later",
          statusCode: 500,
        };
      }

      return {
        data: {
          id: data?.id,
          fullname: data?.fullname,
          email: data?.email,
          role: data?.role,
        },
        statusCode: 200,
      };
    } catch {
      return {
        error: "An unexpected error occurred. Please try again later",
        statusCode: 500,
      };
    }
  },
  refreshToken: async (refreshToken: string) => {
    try {
      const result = await verifyRefreshToken(refreshToken);

      if (result.error) {
        return {
          error: result.error,
          statusCode: 401,
        };
      }

      if (!result.payload) {
        return {
          error: "Invalid refresh token",
          statusCode: 401,
        };
      }

      const newAccessToken = generateToken({
        userId: result.payload.userId,
        email: result.payload.email,
      });

      const newRefreshToken = generateRefreshToken({
        userId: result.payload.userId,
        email: result.payload.email,
      });

      await AuthRepository.invalidateRefreshToken(
        refreshToken,
        result.payload.userId,
      );

      return {
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
        statusCode: 200,
      };
    } catch {
      return {
        error: "An unexpected error occurred. Please try again later",
        statusCode: 500,
      };
    }
  },
};
