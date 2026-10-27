import { describe, expect, test, beforeEach } from "vitest";
import { replyContactMessage, updateContactMessageStatus } from "./contact";
import { profileDB } from "./db";

async function seedMessage(overrides: Partial<{
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
}> = {}): Promise<number> {
  const row = await profileDB.queryRow<{ id: number }>`
    INSERT INTO contact_messages (name, email, subject, message, status, ip_address)
    VALUES (
      ${overrides.name ?? "Test User"},
      ${overrides.email ?? "testuser@example.com"},
      ${overrides.subject ?? "Test Subject"},
      ${overrides.message ?? "Test message body."},
      ${overrides.status ?? "unread"},
      'unknown'
    )
    RETURNING id
  `;
  return row!.id;
}

describe("replyContactMessage", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM contact_messages`;
  });

  test("returns the updated contact message with replied status", async () => {
    const id = await seedMessage({ email: "sender@example.com" });

    const result = await replyContactMessage({
      id,
      subject: "Re: Your inquiry",
      body: "Thank you for reaching out.",
    });

    expect(result.id).toBe(id);
    expect(result.status).toBe("replied");
  });

  test("sets replied_at to a recent timestamp in the database", async () => {
    const id = await seedMessage();

    const before = new Date();
    await replyContactMessage({ id, subject: "Re: Hello", body: "Here is my reply." });
    const after = new Date();

    const row = await profileDB.queryRow<{ status: string; replied_at: Date }>`
      SELECT status, replied_at FROM contact_messages WHERE id = ${id}
    `;

    expect(row!.status).toBe("replied");
    expect(row!.replied_at).not.toBeNull();
    expect(new Date(row!.replied_at).getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(new Date(row!.replied_at).getTime()).toBeLessThanOrEqual(after.getTime());
  });

  test("persists status change to replied in the database", async () => {
    const id = await seedMessage({ status: "read" });

    await replyContactMessage({ id, subject: "Follow-up", body: "Just following up!" });

    const row = await profileDB.queryRow<{ status: string }>`
      SELECT status FROM contact_messages WHERE id = ${id}
    `;
    expect(row!.status).toBe("replied");
  });

  test("works when replying to an unread message", async () => {
    const id = await seedMessage({ status: "unread" });

    const result = await replyContactMessage({ id, subject: "Reply", body: "Hi there." });

    expect(result.status).toBe("replied");

    const row = await profileDB.queryRow<{ status: string }>`
      SELECT status FROM contact_messages WHERE id = ${id}
    `;
    expect(row!.status).toBe("replied");
  });

  test("returned message contains expected shape fields", async () => {
    const id = await seedMessage({ name: "Jane Doe", email: "jane@example.com" });

    const result = await replyContactMessage({ id, subject: "Shape test", body: "Testing shape." });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("replied_at");
    expect(result).toHaveProperty("created_at");
  });

  test("does not modify other messages when replying to one", async () => {
    const id1 = await seedMessage({ email: "first@example.com" });
    const id2 = await seedMessage({ email: "second@example.com" });

    await replyContactMessage({ id: id1, subject: "Reply to first", body: "Replying to first." });

    const row2 = await profileDB.queryRow<{ status: string }>`
      SELECT status FROM contact_messages WHERE id = ${id2}
    `;
    expect(row2!.status).toBe("unread");
  });

  test("throws not found for a non-existent message id", async () => {
    await expect(
      replyContactMessage({ id: 999999, subject: "Ghost reply", body: "Nobody home." })
    ).rejects.toThrow();
  });

  test("throws invalidArgument when subject is empty", async () => {
    const id = await seedMessage();

    await expect(
      replyContactMessage({ id, subject: "   ", body: "Valid body." })
    ).rejects.toThrow();
  });

  test("throws invalidArgument when body is empty", async () => {
    const id = await seedMessage();

    await expect(
      replyContactMessage({ id, subject: "Valid subject", body: "   " })
    ).rejects.toThrow();
  });

  test("can reply to an already-replied message again", async () => {
    const id = await seedMessage({ status: "replied" });

    const result = await replyContactMessage({ id, subject: "Second reply", body: "Replying again." });

    expect(result.status).toBe("replied");
  });
});

describe("updateContactMessageStatus (reply transition)", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM contact_messages`;
  });

  test("transitions status from unread to replied and sets replied_at", async () => {
    const id = await seedMessage({ status: "unread" });

    const before = new Date();
    const result = await updateContactMessageStatus({ id, status: "replied" });
    const after = new Date();

    expect(result.status).toBe("replied");
    expect(result.replied_at).not.toBeNull();
    expect(new Date(result.replied_at!).getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(new Date(result.replied_at!).getTime()).toBeLessThanOrEqual(after.getTime());
  });

  test("transitions from unread to read without setting replied_at", async () => {
    const id = await seedMessage({ status: "unread" });

    const result = await updateContactMessageStatus({ id, status: "read" });

    expect(result.status).toBe("read");
    expect(result.replied_at).toBeUndefined();
  });

  test("transitions from read to archived", async () => {
    const id = await seedMessage({ status: "read" });

    const result = await updateContactMessageStatus({ id, status: "archived" });

    expect(result.status).toBe("archived");

    const row = await profileDB.queryRow<{ status: string }>`
      SELECT status FROM contact_messages WHERE id = ${id}
    `;
    expect(row!.status).toBe("archived");
  });

  test("does not overwrite existing replied_at when already replied", async () => {
    const id = await seedMessage({ status: "unread" });
    await updateContactMessageStatus({ id, status: "replied" });

    const firstReply = await profileDB.queryRow<{ replied_at: Date }>`
      SELECT replied_at FROM contact_messages WHERE id = ${id}
    `;

    await updateContactMessageStatus({ id, status: "read" });

    const afterRead = await profileDB.queryRow<{ replied_at: Date }>`
      SELECT replied_at FROM contact_messages WHERE id = ${id}
    `;
    expect(new Date(afterRead!.replied_at).getTime()).toBe(
      new Date(firstReply!.replied_at).getTime()
    );
  });

  test("throws not found for non-existent message", async () => {
    await expect(updateContactMessageStatus({ id: 999999, status: "read" })).rejects.toThrow();
  });

  test("throws invalidArgument for invalid status value", async () => {
    const id = await seedMessage();

    await expect(
      updateContactMessageStatus({ id, status: "invalid-status" as any })
    ).rejects.toThrow();
  });

  test("persists status change to database", async () => {
    const id = await seedMessage({ status: "unread" });

    await updateContactMessageStatus({ id, status: "read" });

    const row = await profileDB.queryRow<{ status: string }>`
      SELECT status FROM contact_messages WHERE id = ${id}
    `;
    expect(row!.status).toBe("read");
  });
});
