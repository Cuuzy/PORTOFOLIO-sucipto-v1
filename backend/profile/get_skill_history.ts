import { api } from "encore.dev/api";
import { profileDB } from "./db";

export interface SkillHistoryPoint {
  skillId: number;
  skillName: string;
  category: string;
  percentage: number;
  recordedAt: string;
  note?: string;
}

export interface SkillHistoryResponse {
  history: SkillHistoryPoint[];
}

export const getSkillHistory = api<void, SkillHistoryResponse>(
  { expose: true, method: "GET", path: "/skills/history" },
  async () => {
    const history = await profileDB.queryAll<SkillHistoryPoint>`
      SELECT 
        sh.skill_id as "skillId",
        s.name as "skillName",
        s.category,
        sh.percentage,
        TO_CHAR(sh.recorded_at, 'YYYY-MM-DD') as "recordedAt",
        sh.note
      FROM skill_history sh
      JOIN skills s ON s.id = sh.skill_id
      ORDER BY sh.recorded_at ASC, s.name ASC
    `;

    return { history };
  }
);
