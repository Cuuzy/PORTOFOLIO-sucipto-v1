import { api } from "encore.dev/api";
import { analyticsDB } from "./db";
import { profileDB } from "../profile/db";

export interface DailyVisitors {
  date: string;
  uniqueVisitors: number;
  totalViews: number;
}

export interface PageStat {
  pagePath: string;
  views: number;
}

export interface AnalyticsStats {
  totalViews: number;
  totalUniqueVisitors: number;
  cvDownloads: number;
  dailyVisitors: DailyVisitors[];
  topPages: PageStat[];
}

// Returns aggregated analytics statistics (auth required).
export const getStats = api(
  { expose: true, method: "GET", path: "/analytics/stats", auth: true },
  async (): Promise<AnalyticsStats> => {
    const totalViewsRow = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM page_views
    `;

    const totalUniqueRow = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(DISTINCT visitor_hash) as count FROM page_views
    `;

    const cvDownloadsRow = await profileDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM activity_tracking WHERE activity_type = 'cv_download'
    `;

    const dailyRows = await analyticsDB.queryAll<{
      date: string;
      uniqueVisitors: number;
      totalViews: number;
    }>`
      SELECT
        TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date,
        COUNT(DISTINCT visitor_hash) as "uniqueVisitors",
        COUNT(*) as "totalViews"
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    const topPagesRows = await analyticsDB.queryAll<{
      pagePath: string;
      views: number;
    }>`
      SELECT page_path as "pagePath", COUNT(*) as views
      FROM page_views
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `;

    return {
      totalViews: Number(totalViewsRow?.count ?? 0),
      totalUniqueVisitors: Number(totalUniqueRow?.count ?? 0),
      cvDownloads: Number(cvDownloadsRow?.count ?? 0),
      dailyVisitors: dailyRows.map((r) => ({
        date: r.date,
        uniqueVisitors: Number(r.uniqueVisitors),
        totalViews: Number(r.totalViews),
      })),
      topPages: topPagesRows.map((r) => ({
        pagePath: r.pagePath,
        views: Number(r.views),
      })),
    };
  }
);
