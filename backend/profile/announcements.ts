import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";

export interface Announcement {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_active: boolean;
  is_dismissible: boolean;
  link_url?: string;
  link_label?: string;
  starts_at?: Date;
  ends_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface GetActiveAnnouncementsResponse {
  announcements: Announcement[];
}

export interface ListAnnouncementsResponse {
  announcements: Announcement[];
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_active: boolean;
  is_dismissible: boolean;
  link_url?: string;
  link_label?: string;
  starts_at?: string;
  ends_at?: string;
}

export interface UpdateAnnouncementRequest {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_active: boolean;
  is_dismissible: boolean;
  link_url?: string;
  link_label?: string;
  starts_at?: string;
  ends_at?: string;
}

export interface DeleteAnnouncementRequest {
  id: number;
}

export const getActiveAnnouncements = api(
  { method: "GET", path: "/announcements", expose: true },
  async (): Promise<GetActiveAnnouncementsResponse> => {
    const now = new Date().toISOString();
    const announcements = await profileDB.rawQueryAll<Announcement>(
      `SELECT * FROM announcements
       WHERE is_active = TRUE
         AND (starts_at IS NULL OR starts_at <= $1)
         AND (ends_at IS NULL OR ends_at >= $1)
       ORDER BY created_at DESC`,
      now
    );
    return { announcements };
  }
);

export const listAnnouncements = api(
  { method: "GET", path: "/admin/announcements", auth: true, expose: true },
  async (): Promise<ListAnnouncementsResponse> => {
    const announcements = await profileDB.queryAll<Announcement>`
      SELECT * FROM announcements ORDER BY created_at DESC
    `;
    return { announcements };
  }
);

export const createAnnouncement = api(
  { method: "POST", path: "/admin/announcements", auth: true, expose: true },
  async (req: CreateAnnouncementRequest): Promise<Announcement> => {
    if (!req.title.trim() || !req.message.trim()) {
      throw APIError.invalidArgument("Title and message are required");
    }

    const row = await profileDB.queryRow<Announcement>`
      INSERT INTO announcements (title, message, type, is_active, is_dismissible, link_url, link_label, starts_at, ends_at)
      VALUES (
        ${req.title.trim()},
        ${req.message.trim()},
        ${req.type},
        ${req.is_active},
        ${req.is_dismissible},
        ${req.link_url?.trim() || null},
        ${req.link_label?.trim() || null},
        ${req.starts_at || null},
        ${req.ends_at || null}
      )
      RETURNING *
    `;
    if (!row) throw APIError.internal("Failed to create announcement");
    return row;
  }
);

export const updateAnnouncement = api(
  { method: "PUT", path: "/admin/announcements/:id", auth: true, expose: true },
  async (req: UpdateAnnouncementRequest): Promise<Announcement> => {
    if (!req.title.trim() || !req.message.trim()) {
      throw APIError.invalidArgument("Title and message are required");
    }

    const existing = await profileDB.queryRow`
      SELECT id FROM announcements WHERE id = ${req.id}
    `;
    if (!existing) throw APIError.notFound("Announcement not found");

    const row = await profileDB.queryRow<Announcement>`
      UPDATE announcements
      SET title = ${req.title.trim()},
          message = ${req.message.trim()},
          type = ${req.type},
          is_active = ${req.is_active},
          is_dismissible = ${req.is_dismissible},
          link_url = ${req.link_url?.trim() || null},
          link_label = ${req.link_label?.trim() || null},
          starts_at = ${req.starts_at || null},
          ends_at = ${req.ends_at || null},
          updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!row) throw APIError.internal("Failed to update announcement");
    return row;
  }
);

export const deleteAnnouncement = api(
  { method: "DELETE", path: "/admin/announcements/:id", auth: true, expose: true },
  async (req: DeleteAnnouncementRequest): Promise<void> => {
    const existing = await profileDB.queryRow`
      SELECT id FROM announcements WHERE id = ${req.id}
    `;
    if (!existing) throw APIError.notFound("Announcement not found");
    await profileDB.exec`DELETE FROM announcements WHERE id = ${req.id}`;
  }
);
