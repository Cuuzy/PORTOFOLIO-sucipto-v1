import { api } from "encore.dev/api";
import { profileDB } from "./db";
import { getAuthData } from "~encore/auth";

export interface SendPushNotificationRequest {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface SendPushNotificationResponse {
  success: boolean;
  message: string;
  sentCount: number;
  failedCount: number;
}

interface PushSubscription {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export const send_push_notification = api(
  { method: "POST", path: "/profile/send_push_notification", expose: true, auth: true },
  async (req: SendPushNotificationRequest): Promise<SendPushNotificationResponse> => {
    const authData = getAuthData();
    if (!authData || authData.username !== "ito") {
      throw new Error("Unauthorized");
    }

    const { title, body, url = "/", tag = "notification" } = req;

    const subscriptions = await profileDB.query<PushSubscription>`
      SELECT id, endpoint, p256dh, auth
      FROM push_subscriptions
      WHERE is_active = true
    `;

    let sentCount = 0;
    let failedCount = 0;

    const payload = JSON.stringify({
      title,
      body,
      url,
      tag
    });

    for await (const sub of subscriptions) {
      try {
        await sendWebPushNotification(sub, payload);
        
        await profileDB.exec`
          UPDATE push_subscriptions 
          SET last_notified_at = CURRENT_TIMESTAMP 
          WHERE id = ${sub.id}
        `;
        
        sentCount++;
      } catch (error) {
        console.error(`Failed to send notification to ${sub.endpoint}:`, error);
        
        await profileDB.exec`
          UPDATE push_subscriptions 
          SET is_active = false 
          WHERE id = ${sub.id}
        `;
        
        failedCount++;
      }
    }

    return {
      success: true,
      message: `Sent ${sentCount} notifications, ${failedCount} failed`,
      sentCount,
      failedCount
    };
  }
);

async function sendWebPushNotification(subscription: PushSubscription, payload: string): Promise<void> {
  console.log('Push notification would be sent to:', subscription.endpoint);
  console.log('Payload:', payload);
}
