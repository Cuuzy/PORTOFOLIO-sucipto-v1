import { api, Header } from "encore.dev/api";
import { analyticsDB } from "./db";
import * as crypto from "crypto";

export interface TrackPageViewRequest {
  pagePath: string;
  referrer?: string;
  userAgent?: Header<"User-Agent">;
  xForwardedFor?: Header<"X-Forwarded-For">;
}

// Records a page view for analytics tracking.
export const trackPageView = api(
  { expose: true, method: "POST", path: "/analytics/pageview" },
  async (req: TrackPageViewRequest): Promise<void> => {
    const ua = req.userAgent || "";
    const ip = req.xForwardedFor?.split(",")[0]?.trim() || "";
    const visitorHash = crypto
      .createHash("sha256")
      .update(`${ip}:${ua}`)
      .digest("hex")
      .slice(0, 16);

    await analyticsDB.exec`
      INSERT INTO page_views (page_path, referrer, user_agent, visitor_hash)
      VALUES (${req.pagePath}, ${req.referrer || ""}, ${ua}, ${visitorHash})
    `;
  }
);
