import { api, Header } from "encore.dev/api";
import { profileDB } from "./db";

export interface TrackActivityRequest {
  activityType: string;
  description?: string;
  userAgent?: Header<"User-Agent">;
}

export interface RecentActivity {
  id: number;
  activityType: string;
  description: string;
  createdAt: Date;
  timeAgo: string;
}

export interface RecentActivitiesResponse {
  activities: RecentActivity[];
}

// Tracks user activity (CV downloads, profile views, etc.)
export const trackActivity = api(
  { expose: true, method: "POST", path: "/profile/activity/track" },
  async (req: TrackActivityRequest): Promise<void> => {
    await profileDB.exec`
      INSERT INTO activity_tracking (activity_type, description, user_agent)
      VALUES (${req.activityType}, ${req.description || ""}, ${req.userAgent || ""})
    `;
  }
);

// Gets recent activities for social proof notifications
export const getRecentActivities = api<void, RecentActivitiesResponse>(
  { expose: true, method: "GET", path: "/profile/activity/recent" },
  async () => {
    const activities = await profileDB.queryAll<{
      id: number;
      activityType: string;
      description: string;
      createdAt: Date;
    }>`
      SELECT id, activity_type as "activityType", description, created_at as "createdAt"
      FROM activity_tracking
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const activitiesWithTime = activities.map((activity) => {
      const minutesAgo = Math.floor(
        (Date.now() - new Date(activity.createdAt).getTime()) / 60000
      );

      let timeAgo: string;
      if (minutesAgo < 1) {
        timeAgo = "just now";
      } else if (minutesAgo < 60) {
        timeAgo = `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
      } else {
        const hoursAgo = Math.floor(minutesAgo / 60);
        timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
      }

      return {
        id: activity.id,
        activityType: activity.activityType,
        description: activity.description,
        createdAt: activity.createdAt,
        timeAgo,
      };
    });

    return { activities: activitiesWithTime };
  }
);
