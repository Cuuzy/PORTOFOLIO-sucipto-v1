import { api } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface CreateToolRequest {
  name: string;
  iconUrl?: string;
}

export interface UpdateToolRequest {
  id: number;
  name: string;
  iconUrl?: string;
}

export interface DeleteToolRequest {
  id: number;
}

export interface ToolResponse {
  success: boolean;
}

// Creates a new tool
export const createTool = api<CreateToolRequest, ToolResponse>(
  { expose: true, method: "POST", path: "/tools" },
  async (req) => {
    await profileDB.exec`
      INSERT INTO tools (name, icon_url)
      VALUES (${req.name}, ${req.iconUrl ?? null})
    `;
    return { success: true };
  }
);

// Updates an existing tool
export const updateTool = api<UpdateToolRequest, ToolResponse>(
  { expose: true, method: "PUT", path: "/tools/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM tools WHERE id = ${req.id}`,
      "Tool"
    );
    await profileDB.exec`
      UPDATE tools
      SET name = ${req.name},
          icon_url = ${req.iconUrl ?? null}
      WHERE id = ${req.id}
    `;
    return { success: true };
  }
);

// Deletes a tool
export const deleteTool = api<DeleteToolRequest, ToolResponse>(
  { expose: true, method: "DELETE", path: "/tools/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM tools WHERE id = ${req.id}`,
      "Tool"
    );
    await profileDB.exec`
      DELETE FROM tools WHERE id = ${req.id}
    `;
    return { success: true };
  }
);
