import { describe, expect, test, beforeEach } from "vitest";
import { getProfile } from "./get_profile";
import { profileDB } from "./db";

describe("getProfile", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM skills`;
    await profileDB.exec`DELETE FROM education`;
    await profileDB.exec`DELETE FROM certificates`;
    await profileDB.exec`DELETE FROM tools`;
    await profileDB.exec`DELETE FROM social_media`;
    await profileDB.exec`DELETE FROM projects`;
    await profileDB.exec`DELETE FROM work_experience`;
    await profileDB.exec`DELETE FROM profiles`;
    await profileDB.exec`
      INSERT INTO profiles (name, title, location, email, phone)
      VALUES ('Test User', 'Developer', 'Jakarta', 'test@example.com', '+62 000-0000-000')
    `;
  });

  test("returns profile with required fields", async () => {
    const result = await getProfile();

    expect(result.profile).toBeDefined();
    expect(result.profile.name).toBe("Test User");
    expect(result.profile.title).toBe("Developer");
    expect(result.profile.location).toBe("Jakarta");
    expect(result.profile.email).toBe("test@example.com");
    expect(result.profile.phone).toBe("+62 000-0000-000");
  });

  test("returns all data collections even when empty", async () => {
    const result = await getProfile();

    expect(Array.isArray(result.skills)).toBe(true);
    expect(Array.isArray(result.education)).toBe(true);
    expect(Array.isArray(result.certificates)).toBe(true);
    expect(Array.isArray(result.tools)).toBe(true);
    expect(Array.isArray(result.socialMedia)).toBe(true);
    expect(Array.isArray(result.projects)).toBe(true);
    expect(Array.isArray(result.workExperience)).toBe(true);
  });

  test("returns skills ordered by percentage descending", async () => {
    await profileDB.exec`
      INSERT INTO skills (name, percentage, category) VALUES
      ('CSS', 60, 'language'),
      ('TypeScript', 90, 'language'),
      ('HTML', 75, 'language')
    `;

    const result = await getProfile();

    expect(result.skills[0].percentage).toBeGreaterThanOrEqual(result.skills[1].percentage);
    expect(result.skills[1].percentage).toBeGreaterThanOrEqual(result.skills[2].percentage);
  });

  test("only returns featured projects", async () => {
    await profileDB.exec`
      INSERT INTO projects (title, description, featured) VALUES
      ('Featured Project', 'A featured one', true),
      ('Hidden Project', 'Not featured', false)
    `;

    const result = await getProfile();

    expect(result.projects.every((p) => p.featured)).toBe(true);
    expect(result.projects.some((p) => p.title === "Featured Project")).toBe(true);
    expect(result.projects.some((p) => p.title === "Hidden Project")).toBe(false);
  });

  test("throws when no profile exists", async () => {
    await profileDB.exec`DELETE FROM profiles`;

    await expect(getProfile()).rejects.toThrow("Profile not found");
  });
});
