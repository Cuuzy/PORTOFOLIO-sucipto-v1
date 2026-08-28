import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";
import crypto from "crypto";

export interface NewsletterSubscriber {
  id: number;
  email: string;
  name?: string;
  subscribed_at: Date;
  status: string;
  unsubscribed_at?: Date;
  unsubscribe_token: string;
}

export interface SubscribeRequest {
  email: string;
  name?: string;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
}

export interface UnsubscribeRequest {
  token: string;
}

export interface UnsubscribeResponse {
  success: boolean;
  message: string;
}

export interface ListSubscribersRequest {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ListSubscribersResponse {
  subscribers: NewsletterSubscriber[];
  total: number;
  active_count: number;
}

export const subscribe = api(
  { method: "POST", path: "/newsletter/subscribe", expose: true },
  async (req: SubscribeRequest): Promise<SubscribeResponse> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.email)) {
      throw APIError.invalidArgument("Invalid email format");
    }

    const email = req.email.trim().toLowerCase();
    const name = req.name?.trim() || null;

    const existing = await profileDB.queryRow<{ id: number; status: string }>`
      SELECT id, status FROM newsletter_subscribers WHERE email = ${email}
    `;

    if (existing) {
      if (existing.status === "active") {
        return { success: true, message: "You are already subscribed to the newsletter." };
      }
      const token = crypto.randomBytes(32).toString("hex");
      await profileDB.exec`
        UPDATE newsletter_subscribers
        SET status = 'active', unsubscribed_at = NULL, subscribed_at = NOW(), unsubscribe_token = ${token}, name = ${name}
        WHERE id = ${existing.id}
      `;
      return { success: true, message: "Welcome back! You have been re-subscribed to the newsletter." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    await profileDB.exec`
      INSERT INTO newsletter_subscribers (email, name, unsubscribe_token)
      VALUES (${email}, ${name}, ${token})
    `;

    return { success: true, message: "Thank you for subscribing! You will receive updates via email." };
  }
);

export const unsubscribe = api(
  { method: "POST", path: "/newsletter/unsubscribe", expose: true },
  async (req: UnsubscribeRequest): Promise<UnsubscribeResponse> => {
    if (!req.token) {
      throw APIError.invalidArgument("Unsubscribe token is required");
    }

    const subscriber = await profileDB.queryRow<{ id: number; status: string }>`
      SELECT id, status FROM newsletter_subscribers WHERE unsubscribe_token = ${req.token}
    `;

    if (!subscriber) {
      throw APIError.notFound("Invalid unsubscribe token");
    }

    if (subscriber.status === "unsubscribed") {
      return { success: true, message: "You have already unsubscribed from the newsletter." };
    }

    await profileDB.exec`
      UPDATE newsletter_subscribers
      SET status = 'unsubscribed', unsubscribed_at = NOW()
      WHERE id = ${subscriber.id}
    `;

    return { success: true, message: "You have been successfully unsubscribed from the newsletter." };
  }
);

export const listSubscribers = api(
  { method: "GET", path: "/admin/newsletter/subscribers", auth: true, expose: true },
  async (req: ListSubscribersRequest): Promise<ListSubscribersResponse> => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let subscribers: NewsletterSubscriber[];
    let total: { count: number } | null;

    if (req.status) {
      subscribers = await profileDB.queryAll<NewsletterSubscriber>`
        SELECT * FROM newsletter_subscribers WHERE status = ${req.status}
        ORDER BY subscribed_at DESC LIMIT ${limit} OFFSET ${offset}
      `;
      total = await profileDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM newsletter_subscribers WHERE status = ${req.status}
      `;
    } else {
      subscribers = await profileDB.queryAll<NewsletterSubscriber>`
        SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT ${limit} OFFSET ${offset}
      `;
      total = await profileDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM newsletter_subscribers
      `;
    }

    const activeCount = await profileDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM newsletter_subscribers WHERE status = 'active'
    `;

    return {
      subscribers,
      total: total?.count || 0,
      active_count: activeCount?.count || 0,
    };
  }
);
