import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
}

// Simple admin login using fixed credentials
// username: ito, password: ito31102002
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/admin/login" },
  async (req) => {
    const { username, password } = req;

    // Validate credentials
    if (username !== "ito" || password !== "ito31102002") {
      throw APIError.unauthenticated("Invalid credentials");
    }

    // Ensure admin exists in DB (idempotent upsert-like)
    const existing = await profileDB.queryRow<{ id: number }>`
      SELECT id FROM admins WHERE username = ${username}
    `;
    if (!existing) {
      await profileDB.exec`
        INSERT INTO admins (username, password_hash) VALUES (${username}, 'fixed-credential-login')
      `;
    }

    // Generate a simple time-bound token (base64 "username:timestamp")
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

    return {
      success: true,
      token,
    };
  }
);

// Verify admin token
export const verifyToken = api<VerifyTokenRequest, VerifyTokenResponse>(
  { expose: true, method: "POST", path: "/admin/verify" },
  async (req) => {
    try {
      const decoded = Buffer.from(req.token, "base64").toString();
      const [username, timestamp] = decoded.split(":");

      if (username !== "ito") {
        return { valid: false };
      }

      // Check if token is not older than 24 hours
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      const isValid = now - tokenTime < 24 * 60 * 60 * 1000;

      return { valid: isValid };
    } catch {
      return { valid: false };
    }
  }
);
