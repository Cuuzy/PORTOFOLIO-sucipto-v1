import { describe, expect, test, beforeEach } from "vitest";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
} from "./announcements";
import { profileDB } from "./db";

describe("announcement CRUD", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM announcements`;
  });

  describe("createAnnouncement", () => {
    test("creates an announcement and returns it with an id", async () => {
      const result = await createAnnouncement({
        title: "System Update",
        message: "The system will be down for maintenance.",
        type: "warning",
        is_active: true,
        is_dismissible: true,
      });

      expect(result.id).toBeDefined();
      expect(result.title).toBe("System Update");
      expect(result.message).toBe("The system will be down for maintenance.");
      expect(result.type).toBe("warning");
      expect(result.is_active).toBe(true);
      expect(result.is_dismissible).toBe(true);
    });

    test("persists the announcement to the database", async () => {
      const result = await createAnnouncement({
        title: "New Feature",
        message: "Check out our new feature!",
        type: "info",
        is_active: true,
        is_dismissible: false,
      });

      const row = await profileDB.queryRow<{
        title: string;
        message: string;
        type: string;
        is_active: boolean;
        is_dismissible: boolean;
      }>`
        SELECT title, message, type, is_active, is_dismissible
        FROM announcements WHERE id = ${result.id}
      `;

      expect(row).not.toBeNull();
      expect(row!.title).toBe("New Feature");
      expect(row!.message).toBe("Check out our new feature!");
      expect(row!.type).toBe("info");
      expect(row!.is_active).toBe(true);
      expect(row!.is_dismissible).toBe(false);
    });

    test("stores optional link_url and link_label", async () => {
      const result = await createAnnouncement({
        title: "Read More",
        message: "Click the link below.",
        type: "info",
        is_active: true,
        is_dismissible: true,
        link_url: "https://example.com",
        link_label: "Learn More",
      });

      expect(result.link_url).toBe("https://example.com");
      expect(result.link_label).toBe("Learn More");

      const row = await profileDB.queryRow<{ link_url: string; link_label: string }>`
        SELECT link_url, link_label FROM announcements WHERE id = ${result.id}
      `;
      expect(row!.link_url).toBe("https://example.com");
      expect(row!.link_label).toBe("Learn More");
    });

    test("stores starts_at and ends_at dates", async () => {
      const startsAt = "2025-01-01T00:00:00Z";
      const endsAt = "2025-12-31T23:59:59Z";

      const result = await createAnnouncement({
        title: "Timed Announcement",
        message: "Only visible during 2025.",
        type: "success",
        is_active: true,
        is_dismissible: true,
        starts_at: startsAt,
        ends_at: endsAt,
      });

      expect(result.starts_at).toBeDefined();
      expect(result.ends_at).toBeDefined();
    });

    test("trims whitespace from title and message", async () => {
      const result = await createAnnouncement({
        title: "  Padded Title  ",
        message: "  Padded message.  ",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });

      expect(result.title).toBe("Padded Title");
      expect(result.message).toBe("Padded message.");
    });

    test("throws invalidArgument for empty title", async () => {
      await expect(
        createAnnouncement({
          title: "   ",
          message: "Valid message.",
          type: "info",
          is_active: true,
          is_dismissible: true,
        })
      ).rejects.toThrow();
    });

    test("throws invalidArgument for empty message", async () => {
      await expect(
        createAnnouncement({
          title: "Valid Title",
          message: "   ",
          type: "info",
          is_active: true,
          is_dismissible: true,
        })
      ).rejects.toThrow();
    });

    test("supports all valid types", async () => {
      for (const type of ["info", "success", "warning", "error"] as const) {
        const result = await createAnnouncement({
          title: `${type} announcement`,
          message: "Type test message.",
          type,
          is_active: true,
          is_dismissible: true,
        });
        expect(result.type).toBe(type);
      }
    });
  });

  describe("updateAnnouncement", () => {
    test("updates title, message and type", async () => {
      const created = await createAnnouncement({
        title: "Original Title",
        message: "Original message.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });

      const updated = await updateAnnouncement({
        id: created.id,
        title: "Updated Title",
        message: "Updated message.",
        type: "success",
        is_active: true,
        is_dismissible: false,
      });

      expect(updated.title).toBe("Updated Title");
      expect(updated.message).toBe("Updated message.");
      expect(updated.type).toBe("success");
      expect(updated.is_dismissible).toBe(false);
    });

    test("persists updates to the database", async () => {
      const created = await createAnnouncement({
        title: "Before",
        message: "Before update.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });

      await updateAnnouncement({
        id: created.id,
        title: "After",
        message: "After update.",
        type: "warning",
        is_active: false,
        is_dismissible: true,
      });

      const row = await profileDB.queryRow<{ title: string; is_active: boolean }>`
        SELECT title, is_active FROM announcements WHERE id = ${created.id}
      `;
      expect(row!.title).toBe("After");
      expect(row!.is_active).toBe(false);
    });

    test("updates updated_at timestamp", async () => {
      const created = await createAnnouncement({
        title: "Time Test",
        message: "Testing timestamp update.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });

      const before = new Date();
      const updated = await updateAnnouncement({
        id: created.id,
        title: "Time Test Updated",
        message: "Updated.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });
      const after = new Date();

      const updatedAt = new Date(updated.updated_at);
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test("throws not found for non-existent announcement", async () => {
      await expect(
        updateAnnouncement({
          id: 999999,
          title: "Ghost",
          message: "Ghost message.",
          type: "info",
          is_active: true,
          is_dismissible: true,
        })
      ).rejects.toThrow();
    });

    test("throws invalidArgument for empty title on update", async () => {
      const created = await createAnnouncement({
        title: "Valid",
        message: "Valid message.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });

      await expect(
        updateAnnouncement({
          id: created.id,
          title: "   ",
          message: "Valid message.",
          type: "info",
          is_active: true,
          is_dismissible: true,
        })
      ).rejects.toThrow();
    });

    test("clears link_url and link_label when omitted on update", async () => {
      const created = await createAnnouncement({
        title: "With Link",
        message: "Has a link.",
        type: "info",
        is_active: true,
        is_dismissible: true,
        link_url: "https://example.com",
        link_label: "Example",
      });

      await updateAnnouncement({
        id: created.id,
        title: "Without Link",
        message: "No link anymore.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });

      const row = await profileDB.queryRow<{ link_url: string | null; link_label: string | null }>`
        SELECT link_url, link_label FROM announcements WHERE id = ${created.id}
      `;
      expect(row!.link_url).toBeNull();
      expect(row!.link_label).toBeNull();
    });
  });

  describe("deleteAnnouncement", () => {
    test("deletes an existing announcement", async () => {
      const created = await createAnnouncement({
        title: "To Be Deleted",
        message: "Will be deleted.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });

      await deleteAnnouncement({ id: created.id });

      const row = await profileDB.queryRow`SELECT id FROM announcements WHERE id = ${created.id}`;
      expect(row).toBeNull();
    });

    test("throws not found for non-existent announcement", async () => {
      await expect(deleteAnnouncement({ id: 999999 })).rejects.toThrow();
    });

    test("only deletes the targeted announcement", async () => {
      const first = await createAnnouncement({
        title: "First",
        message: "First message.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });
      await createAnnouncement({
        title: "Second",
        message: "Second message.",
        type: "success",
        is_active: true,
        is_dismissible: true,
      });

      await deleteAnnouncement({ id: first.id });

      const remaining = await profileDB.queryAll<{ title: string }>`
        SELECT title FROM announcements
      `;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].title).toBe("Second");
    });
  });

  describe("getActiveAnnouncements", () => {
    test("returns only active announcements", async () => {
      await createAnnouncement({
        title: "Active",
        message: "This is active.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });
      await createAnnouncement({
        title: "Inactive",
        message: "This is inactive.",
        type: "info",
        is_active: false,
        is_dismissible: true,
      });

      const result = await getActiveAnnouncements();

      expect(result.announcements).toHaveLength(1);
      expect(result.announcements[0].title).toBe("Active");
    });

    test("returns empty list when no active announcements exist", async () => {
      await createAnnouncement({
        title: "Inactive Only",
        message: "Not active.",
        type: "warning",
        is_active: false,
        is_dismissible: true,
      });

      const result = await getActiveAnnouncements();
      expect(result.announcements).toHaveLength(0);
    });

    test("excludes announcements whose ends_at is in the past", async () => {
      await createAnnouncement({
        title: "Expired",
        message: "This has expired.",
        type: "info",
        is_active: true,
        is_dismissible: true,
        ends_at: "2000-01-01T00:00:00Z",
      });

      const result = await getActiveAnnouncements();
      expect(result.announcements).toHaveLength(0);
    });

    test("excludes announcements whose starts_at is in the future", async () => {
      await createAnnouncement({
        title: "Future",
        message: "Not yet started.",
        type: "info",
        is_active: true,
        is_dismissible: true,
        starts_at: "2099-01-01T00:00:00Z",
      });

      const result = await getActiveAnnouncements();
      expect(result.announcements).toHaveLength(0);
    });

    test("includes announcements within their date window", async () => {
      await createAnnouncement({
        title: "Current",
        message: "Within date range.",
        type: "success",
        is_active: true,
        is_dismissible: true,
        starts_at: "2000-01-01T00:00:00Z",
        ends_at: "2099-12-31T23:59:59Z",
      });

      const result = await getActiveAnnouncements();
      expect(result.announcements).toHaveLength(1);
      expect(result.announcements[0].title).toBe("Current");
    });

    test("includes active announcements with no date constraints", async () => {
      await createAnnouncement({
        title: "Always Active",
        message: "No date limits.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });

      const result = await getActiveAnnouncements();
      expect(result.announcements).toHaveLength(1);
    });

    test("response contains expected shape fields", async () => {
      await createAnnouncement({
        title: "Shape Test",
        message: "Testing response shape.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      });

      const result = await getActiveAnnouncements();
      const ann = result.announcements[0];

      expect(ann).toHaveProperty("id");
      expect(ann).toHaveProperty("title");
      expect(ann).toHaveProperty("message");
      expect(ann).toHaveProperty("type");
      expect(ann).toHaveProperty("is_active");
      expect(ann).toHaveProperty("is_dismissible");
      expect(ann).toHaveProperty("created_at");
      expect(ann).toHaveProperty("updated_at");
    });
  });
});
