import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";

export type AvailabilityStatus = "available" | "busy" | "unavailable";

export interface Availability {
  status: AvailabilityStatus;
  message: string | null;
  updatedAt: Date;
}

export interface UpdateAvailabilityRequest {
  status: AvailabilityStatus;
  message?: string;
}

export const getAvailability = api(
  { method: "GET", path: "/availability", expose: true },
  async (): Promise<Availability> => {
    const row = await profileDB.queryRow<Availability>`
      SELECT status, message, updated_at as "updatedAt"
      FROM availability
      ORDER BY id DESC
      LIMIT 1
    `;
    if (!row) throw APIError.notFound("Availability not found");
    return row;
  }
);

export const updateAvailability = api(
  { method: "PUT", path: "/admin/availability", auth: true, expose: true },
  async (req: UpdateAvailabilityRequest): Promise<Availability> => {
    const validStatuses: AvailabilityStatus[] = ["available", "busy", "unavailable"];
    if (!validStatuses.includes(req.status)) {
      throw APIError.invalidArgument("Invalid status value");
    }

    const existing = await profileDB.queryRow`SELECT id FROM availability ORDER BY id DESC LIMIT 1`;

    let row: Availability | null;
    if (existing) {
      row = await profileDB.queryRow<Availability>`
        UPDATE availability
        SET status = ${req.status},
            message = ${req.message?.trim() || null},
            updated_at = NOW()
        WHERE id = (SELECT id FROM availability ORDER BY id DESC LIMIT 1)
        RETURNING status, message, updated_at as "updatedAt"
      `;
    } else {
      row = await profileDB.queryRow<Availability>`
        INSERT INTO availability (status, message)
        VALUES (${req.status}, ${req.message?.trim() || null})
        RETURNING status, message, updated_at as "updatedAt"
      `;
    }

    if (!row) throw APIError.internal("Failed to update availability");
    return row;
  }
);
