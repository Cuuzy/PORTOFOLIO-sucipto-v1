import { Header, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  username: string;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    const token = data.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    try {
      // Decode and verify our simple token format (username:timestamp)
      const decoded = Buffer.from(token, "base64").toString();
      const [username, timestamp] = decoded.split(":");

      if (username !== "ito") {
        throw APIError.unauthenticated("invalid token");
      }

      // Check if token is not older than 24 hours
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      const isValid = now - tokenTime < 24 * 60 * 60 * 1000;

      if (!isValid) {
        throw APIError.unauthenticated("token expired");
      }

      return {
        userID: username,
        username: username
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err as Error);
    }
  }
);

// Configure the API gateway to use the auth handler.
export const gateway = new Gateway({ authHandler: auth });