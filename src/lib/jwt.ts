import jwt, { SignOptions } from "jsonwebtoken";
import { AuthRepository } from "../modules/auth/auth.repository";

export type JwtPayload = {
  userId: string;
  email: string;
};

export function generateToken(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET!;
  const expiresIn: number = 60 * 10; // 10 minutes

  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
}

export function generateRefreshToken(payload: JwtPayload) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;
  const expiresIn: number = 60 * 60 * 24 * 7; // 7 days

  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): {
  payload?: JwtPayload;
  error?: string;
} {
  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as JwtPayload;
    return { payload };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: "Invalid token" };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { error: "Token expired" };
    }
    if (error instanceof jwt.NotBeforeError) {
      return { error: "Token not active" };
    }
    return { error: "Token verification failed" };
  }
}

export async function verifyAccessToken(token: string): Promise<{
  payload?: JwtPayload;
  error?: string;
}> {
  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as JwtPayload;

    // Check if token is blacklisted
    const { data: isBlacklisted, error: blacklistError } =
      await AuthRepository.isTokenBlacklisted(token);

    if (blacklistError) {
      return { error: "Failed to verify token status" };
    }

    if (isBlacklisted) {
      return { error: "Access token has been invalidated" };
    }

    return { payload };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: "Invalid token" };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { error: "Token expired" };
    }
    if (error instanceof jwt.NotBeforeError) {
      return { error: "Token not active" };
    }
    return { error: "Token verification failed" };
  }
}

export async function verifyRefreshToken(token: string): Promise<{
  payload?: JwtPayload;
  error?: string;
}> {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as JwtPayload;

    const { data: isBlacklisted, error: blacklistError } =
      await AuthRepository.isTokenBlacklisted(token);

    if (blacklistError) {
      return { error: "Failed to verify token status" };
    }

    if (isBlacklisted) {
      return { error: "Refresh token has been invalidated" };
    }

    return { payload };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: "Invalid refresh token" };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { error: "Refresh token expired" };
    }
    if (error instanceof jwt.NotBeforeError) {
      return { error: "Refresh token not active" };
    }
    return { error: "Refresh token verification failed" };
  }
}
