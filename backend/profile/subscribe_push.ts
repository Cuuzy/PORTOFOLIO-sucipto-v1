import { api } from "encore.dev/api";
import { profileDB } from "./db";

interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface PushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys: PushSubscriptionKeys;
}

export interface SubscribePushRequest {
  subscription: PushSubscriptionData;
}

export interface SubscribePushResponse {
  success: boolean;
  message: string;
}

export const subscribe_push = api(
  { method: "POST", path: "/profile/subscribe_push", expose: true },
  async (req: SubscribePushRequest): Promise<SubscribePushResponse> => {
    const { subscription } = req;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new Error("Invalid subscription data");
    }

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    try {
      await profileDB.exec`
        INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent, is_active)
        VALUES (${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth}, ${userAgent}, true)
        ON CONFLICT (endpoint) 
        DO UPDATE SET 
          p256dh = EXCLUDED.p256dh,
          auth = EXCLUDED.auth,
          user_agent = EXCLUDED.user_agent,
          is_active = true,
          subscribed_at = CURRENT_TIMESTAMP
      `;

      return {
        success: true,
        message: "Push subscription saved successfully"
      };
    } catch (error) {
      console.error("Error saving push subscription:", error);
      throw new Error("Failed to save push subscription");
    }
  }
);

export interface UnsubscribePushRequest {
  endpoint: string;
}

export interface UnsubscribePushResponse {
  success: boolean;
  message: string;
}

export const unsubscribe_push = api(
  { method: "POST", path: "/profile/unsubscribe_push", expose: true },
  async (req: UnsubscribePushRequest): Promise<UnsubscribePushResponse> => {
    const { endpoint } = req;

    if (!endpoint) {
      throw new Error("Endpoint is required");
    }

    try {
      await profileDB.exec`
        UPDATE push_subscriptions 
        SET is_active = false 
        WHERE endpoint = ${endpoint}
      `;

      return {
        success: true,
        message: "Push subscription removed successfully"
      };
    } catch (error) {
      console.error("Error removing push subscription:", error);
      throw new Error("Failed to remove push subscription");
    }
  }
);
