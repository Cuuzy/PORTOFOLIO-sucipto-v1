import { describe, expect, test, beforeEach } from "vitest";
import { createSkill, updateSkill, deleteSkill } from "./manage_skills";
import { profileDB } from "./db";

describe("skill CRUD", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM skills`;
  });

  describe("createSkill", () => {
    test("inserts a new skill and returns success", async () => {
      const result = await createSkill({ name: "Go", percentage: 70, category: "language" });

      expect(result.success).toBe(true);

      const row = await profileDB.queryRow<{ name: string; percentage: number; category: string }>`
        SELECT name, percentage, category FROM skills WHERE name = 'Go'
      `;
      expect(row).not.toBeNull();
      expect(row!.name).toBe("Go");
      expect(row!.percentage).toBe(70);
      expect(row!.category).toBe("language");
    });

    test("creates multiple skills independently", async () => {
      await createSkill({ name: "React", percentage: 85, category: "framework" });
      await createSkill({ name: "Vue", percentage: 65, category: "framework" });

      const rows = await profileDB.queryAll<{ name: string }>`SELECT name FROM skills ORDER BY name`;
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.name)).toContain("React");
      expect(rows.map((r) => r.name)).toContain("Vue");
    });
  });

  describe("updateSkill", () => {
    test("updates an existing skill and returns success", async () => {
      const { id } = (await profileDB.queryRow<{ id: number }>`
        INSERT INTO skills (name, percentage, category) VALUES ('Python', 50, 'language') RETURNING id
      `)!;

      const result = await updateSkill({ id, name: "Python", percentage: 80, category: "scripting" });

      expect(result.success).toBe(true);

      const row = await profileDB.queryRow<{ percentage: number; category: string }>`
        SELECT percentage, category FROM skills WHERE id = ${id}
      `;
      expect(row!.percentage).toBe(80);
      expect(row!.category).toBe("scripting");
    });

    test("throws not found when skill does not exist", async () => {
      await expect(
        updateSkill({ id: 999999, name: "Ghost", percentage: 10, category: "none" })
      ).rejects.toThrow();
    });
  });

  describe("deleteSkill", () => {
    test("deletes an existing skill and returns success", async () => {
      const { id } = (await profileDB.queryRow<{ id: number }>`
        INSERT INTO skills (name, percentage, category) VALUES ('Rust', 40, 'language') RETURNING id
      `)!;

      const result = await deleteSkill({ id });

      expect(result.success).toBe(true);

      const row = await profileDB.queryRow`SELECT id FROM skills WHERE id = ${id}`;
      expect(row).toBeNull();
    });

    test("throws not found when skill does not exist", async () => {
      await expect(deleteSkill({ id: 999999 })).rejects.toThrow();
    });

    test("only deletes the targeted skill", async () => {
      const { id: id1 } = (await profileDB.queryRow<{ id: number }>`
        INSERT INTO skills (name, percentage, category) VALUES ('Skill A', 50, 'test') RETURNING id
      `)!;
      await profileDB.exec`
        INSERT INTO skills (name, percentage, category) VALUES ('Skill B', 60, 'test')
      `;

      await deleteSkill({ id: id1 });

      const remaining = await profileDB.queryAll<{ name: string }>`SELECT name FROM skills`;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe("Skill B");
    });
  });
});
