import { describe, expect, test, beforeEach } from "vitest";
import { updateAvailability, getAvailability } from "./availability";
import { profileDB } from "./db";

describe("availability", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM availability`;
  });

  describe("updateAvailability", () => {
    test("inserts a new row when no availability exists", async () => {
      const result = await updateAvailability({ status: "available", message: "Open to work" });

      expect(result.status).toBe("available");
      expect(result.message).toBe("Open to work");

      const count = await profileDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM availability
      `;
      expect(Number(count!.count)).toBe(1);
    });

    test("updates the existing row rather than inserting a new one", async () => {
      await updateAvailability({ status: "available", message: "First" });
      await updateAvailability({ status: "busy", message: "Second" });

      const count = await profileDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM availability
      `;
      expect(Number(count!.count)).toBe(1);

      const row = await profileDB.queryRow<{ status: string; message: string }>`
        SELECT status, message FROM availability ORDER BY id DESC LIMIT 1
      `;
      expect(row!.status).toBe("busy");
      expect(row!.message).toBe("Second");
    });

    test("returns the updated availability with correct shape", async () => {
      const result = await updateAvailability({ status: "unavailable", message: "On vacation" });

      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("updatedAt");
    });

    test("sets message to null when message is not provided", async () => {
      const result = await updateAvailability({ status: "busy" });

      expect(result.message).toBeNull();

      const row = await profileDB.queryRow<{ message: string | null }>`
        SELECT message FROM availability ORDER BY id DESC LIMIT 1
      `;
      expect(row!.message).toBeNull();
    });

    test("trims whitespace from message", async () => {
      const result = await updateAvailability({ status: "available", message: "  Trimmed message  " });

      expect(result.message).toBe("Trimmed message");
    });

    test("supports all valid statuses", async () => {
      for (const status of ["available", "busy", "unavailable"] as const) {
        const result = await updateAvailability({ status });
        expect(result.status).toBe(status);
      }
    });

    test("updates updated_at on each call", async () => {
      const first = await updateAvailability({ status: "available", message: "First" });

      await new Promise((r) => setTimeout(r, 10));

      const second = await updateAvailability({ status: "busy", message: "Second" });

      expect(new Date(second.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(first.updatedAt).getTime()
      );
    });

    test("persists status change to database", async () => {
      await updateAvailability({ status: "available", message: "Initial" });
      await updateAvailability({ status: "unavailable", message: "Away" });

      const row = await profileDB.queryRow<{ status: string }>`
        SELECT status FROM availability ORDER BY id DESC LIMIT 1
      `;
      expect(row!.status).toBe("unavailable");
    });
  });

  describe("getAvailability", () => {
    test("returns the current availability after update", async () => {
      await updateAvailability({ status: "busy", message: "In a meeting" });

      const result = await getAvailability();

      expect(result.status).toBe("busy");
      expect(result.message).toBe("In a meeting");
    });

    test("throws not found when no availability record exists", async () => {
      await expect(getAvailability()).rejects.toThrow();
    });

    test("returns the most recent availability record", async () => {
      await profileDB.exec`INSERT INTO availability (status, message) VALUES ('available', 'Old')`;
      await profileDB.exec`INSERT INTO availability (status, message) VALUES ('busy', 'New')`;

      const result = await getAvailability();
      expect(result.status).toBe("busy");
      expect(result.message).toBe("New");
    });
  });
});
