import { describe, expect, test, beforeEach } from "vitest";
import { subscribe, unsubscribe } from "./newsletter";
import { profileDB } from "./db";

describe("newsletter", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM newsletter_subscribers`;
  });

  describe("subscribe", () => {
    test("subscribes a new email and returns success", async () => {
      const result = await subscribe({ email: "alice@example.com", name: "Alice" });

      expect(result.success).toBe(true);
      expect(typeof result.message).toBe("string");
    });

    test("persists subscriber to the database with active status", async () => {
      await subscribe({ email: "bob@example.com", name: "Bob" });

      const row = await profileDB.queryRow<{
        email: string;
        name: string;
        status: string;
        unsubscribe_token: string;
      }>`
        SELECT email, name, status, unsubscribe_token
        FROM newsletter_subscribers WHERE email = 'bob@example.com'
      `;

      expect(row).not.toBeNull();
      expect(row!.email).toBe("bob@example.com");
      expect(row!.name).toBe("Bob");
      expect(row!.status).toBe("active");
      expect(row!.unsubscribe_token).toBeTruthy();
      expect(row!.unsubscribe_token.length).toBeGreaterThan(0);
    });

    test("generates a unique unsubscribe token per subscriber", async () => {
      await subscribe({ email: "carol@example.com" });
      await subscribe({ email: "dave@example.com" });

      const rows = await profileDB.queryAll<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers
      `;

      expect(rows).toHaveLength(2);
      expect(rows[0].unsubscribe_token).not.toBe(rows[1].unsubscribe_token);
    });

    test("normalizes email to lowercase", async () => {
      await subscribe({ email: "Mixed.CASE@Example.COM" });

      const row = await profileDB.queryRow<{ email: string }>`
        SELECT email FROM newsletter_subscribers WHERE email = 'mixed.case@example.com'
      `;
      expect(row).not.toBeNull();
      expect(row!.email).toBe("mixed.case@example.com");
    });

    test("subscribes without optional name", async () => {
      const result = await subscribe({ email: "noname@example.com" });

      expect(result.success).toBe(true);

      const row = await profileDB.queryRow<{ name: string | null }>`
        SELECT name FROM newsletter_subscribers WHERE email = 'noname@example.com'
      `;
      expect(row!.name).toBeNull();
    });

    test("returns already-subscribed message for duplicate active email", async () => {
      await subscribe({ email: "existing@example.com" });
      const result = await subscribe({ email: "existing@example.com" });

      expect(result.success).toBe(true);
      expect(result.message).toContain("already subscribed");

      const rows = await profileDB.queryAll`
        SELECT id FROM newsletter_subscribers WHERE email = 'existing@example.com'
      `;
      expect(rows).toHaveLength(1);
    });

    test("re-subscribes a previously unsubscribed email", async () => {
      await subscribe({ email: "returnee@example.com" });

      const sub = await profileDB.queryRow<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = 'returnee@example.com'
      `;
      await unsubscribe({ token: sub!.unsubscribe_token });

      const result = await subscribe({ email: "returnee@example.com", name: "Returnee" });

      expect(result.success).toBe(true);

      const row = await profileDB.queryRow<{ status: string }>`
        SELECT status FROM newsletter_subscribers WHERE email = 'returnee@example.com'
      `;
      expect(row!.status).toBe("active");

      const allRows = await profileDB.queryAll`
        SELECT id FROM newsletter_subscribers WHERE email = 'returnee@example.com'
      `;
      expect(allRows).toHaveLength(1);
    });

    test("rotates unsubscribe token on re-subscription", async () => {
      await subscribe({ email: "rotate@example.com" });

      const before = await profileDB.queryRow<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = 'rotate@example.com'
      `;
      await unsubscribe({ token: before!.unsubscribe_token });

      await subscribe({ email: "rotate@example.com" });

      const after = await profileDB.queryRow<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = 'rotate@example.com'
      `;

      expect(after!.unsubscribe_token).not.toBe(before!.unsubscribe_token);
    });

    test("throws invalidArgument for invalid email format", async () => {
      await expect(subscribe({ email: "not-an-email" })).rejects.toThrow();
    });

    test("throws invalidArgument for email with no domain", async () => {
      await expect(subscribe({ email: "user@" })).rejects.toThrow();
    });
  });

  describe("unsubscribe", () => {
    test("unsubscribes using a valid token and returns success", async () => {
      await subscribe({ email: "unsub@example.com" });

      const row = await profileDB.queryRow<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = 'unsub@example.com'
      `;

      const result = await unsubscribe({ token: row!.unsubscribe_token });

      expect(result.success).toBe(true);
      expect(typeof result.message).toBe("string");
    });

    test("sets status to unsubscribed and records unsubscribed_at", async () => {
      await subscribe({ email: "goodbye@example.com" });

      const sub = await profileDB.queryRow<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = 'goodbye@example.com'
      `;

      const before = new Date();
      await unsubscribe({ token: sub!.unsubscribe_token });
      const after = new Date();

      const row = await profileDB.queryRow<{ status: string; unsubscribed_at: Date }>`
        SELECT status, unsubscribed_at FROM newsletter_subscribers WHERE email = 'goodbye@example.com'
      `;

      expect(row!.status).toBe("unsubscribed");
      expect(row!.unsubscribed_at).not.toBeNull();
      expect(new Date(row!.unsubscribed_at).getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(new Date(row!.unsubscribed_at).getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test("returns success message when already unsubscribed", async () => {
      await subscribe({ email: "already-gone@example.com" });

      const sub = await profileDB.queryRow<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = 'already-gone@example.com'
      `;
      const token = sub!.unsubscribe_token;

      await unsubscribe({ token });
      const result = await unsubscribe({ token });

      expect(result.success).toBe(true);
      expect(result.message).toContain("already unsubscribed");
    });

    test("throws not found for an invalid token", async () => {
      await expect(unsubscribe({ token: "completely-invalid-token-xyz" })).rejects.toThrow();
    });

    test("throws invalidArgument when token is empty string", async () => {
      await expect(unsubscribe({ token: "" })).rejects.toThrow();
    });

    test("does not affect other subscribers when one unsubscribes", async () => {
      await subscribe({ email: "stays@example.com" });
      await subscribe({ email: "leaves@example.com" });

      const leavingSub = await profileDB.queryRow<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = 'leaves@example.com'
      `;

      await unsubscribe({ token: leavingSub!.unsubscribe_token });

      const stayingRow = await profileDB.queryRow<{ status: string }>`
        SELECT status FROM newsletter_subscribers WHERE email = 'stays@example.com'
      `;
      expect(stayingRow!.status).toBe("active");
    });

    test("token remains valid (still stored) after unsubscription", async () => {
      await subscribe({ email: "tokencheck@example.com" });

      const sub = await profileDB.queryRow<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = 'tokencheck@example.com'
      `;
      const token = sub!.unsubscribe_token;

      await unsubscribe({ token });

      const row = await profileDB.queryRow<{ unsubscribe_token: string }>`
        SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = 'tokencheck@example.com'
      `;
      expect(row!.unsubscribe_token).toBe(token);
    });
  });
});
