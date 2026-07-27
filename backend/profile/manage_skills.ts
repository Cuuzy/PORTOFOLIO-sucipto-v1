import { api } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface CreateSkillRequest {
  name: string;
  percentage: number;
  category: string;
}

export interface UpdateSkillRequest {
  id: number;
  name: string;
  percentage: number;
  category: string;
}

export interface DeleteSkillRequest {
  id: number;
}

export interface SkillResponse {
  success: boolean;
}

// Creates a new skill
export const createSkill = api<CreateSkillRequest, SkillResponse>(
  { expose: true, auth: true, method: "POST", path: "/skills" },
  async (req) => {
    await profileDB.exec`
      INSERT INTO skills (name, percentage, category)
      VALUES (${req.name}, ${req.percentage}, ${req.category})
    `;

    return { success: true };
  }
);

// Updates an existing skill
export const updateSkill = api<UpdateSkillRequest, SkillResponse>(
  { expose: true, auth: true, method: "PUT", path: "/skills/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM skills WHERE id = ${req.id}`,
      "Skill"
    );
    await profileDB.exec`
      UPDATE skills 
      SET name = ${req.name}, 
          percentage = ${req.percentage}, 
          category = ${req.category}
      WHERE id = ${req.id}
    `;

    return { success: true };
  }
);

// Deletes a skill
export const deleteSkill = api<DeleteSkillRequest, SkillResponse>(
  { expose: true, auth: true, method: "DELETE", path: "/skills/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM skills WHERE id = ${req.id}`,
      "Skill"
    );
    await profileDB.exec`
      DELETE FROM skills WHERE id = ${req.id}
    `;

    return { success: true };
  }
);
