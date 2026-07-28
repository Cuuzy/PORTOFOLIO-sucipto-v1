import { describe, expect, test, beforeEach } from "vitest";
import { sendContactMessage } from "./contact";
import { profileDB } from "./db";

describe("sendContactMessage", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM contact_messages`;
  });

  test("saves a valid message and returns success", async () => {
    const result = await sendContactMessage({
      name: "Alice",
      email: "alice@example.com",
      subject: "Hello",
      message: "This is a test message.",
    });

    expect(result.success).toBe(true);
    expect(typeof result.message).toBe("string");
  });

  test("persists the message to the database", async () => {
    await sendContactMessage({
      name: "Bob",
      email: "bob@example.com",
      subject: "Inquiry",
      message: "I have a question.",
    });

    const row = await profileDB.queryRow<{
      name: string;
      email: string;
      subject: string;
      message: string;
      status: string;
    }>`
      SELECT name, email, subject, message, status FROM contact_messages WHERE email = 'bob@example.com'
    `;

    expect(row).not.toBeNull();
    expect(row!.name).toBe("Bob");
    expect(row!.email).toBe("bob@example.com");
    expect(row!.subject).toBe("Inquiry");
    expect(row!.message).toBe("I have a question.");
    expect(row!.status).toBe("unread");
  });

  test("saves message without optional subject", async () => {
    const result = await sendContactMessage({
      name: "Carol",
      email: "carol@example.com",
      message: "No subject here.",
    });

    expect(result.success).toBe(true);

    const row = await profileDB.queryRow<{ subject: string | null }>`
      SELECT subject FROM contact_messages WHERE email = 'carol@example.com'
    `;
    expect(row).not.toBeNull();
    expect(row!.subject).toBeNull();
  });

  test("trims whitespace from name and message before saving", async () => {
    await sendContactMessage({
      name: "  Dave  ",
      email: "dave@example.com",
      message: "  Padded message.  ",
    });

    const row = await profileDB.queryRow<{ name: string; message: string }>`
      SELECT name, message FROM contact_messages WHERE email = 'dave@example.com'
    `;
    expect(row!.name).toBe("Dave");
    expect(row!.message).toBe("Padded message.");
  });

  test("throws invalidArgument for invalid email format", async () => {
    await expect(
      sendContactMessage({
        name: "Eve",
        email: "not-an-email",
        message: "Test message.",
      })
    ).rejects.toThrow();
  });

  test("throws invalidArgument for empty name", async () => {
    await expect(
      sendContactMessage({
        name: "   ",
        email: "eve@example.com",
        message: "Test message.",
      })
    ).rejects.toThrow();
  });

  test("throws invalidArgument for empty message", async () => {
    await expect(
      sendContactMessage({
        name: "Frank",
        email: "frank@example.com",
        message: "   ",
      })
    ).rejects.toThrow();
  });

  test("throws invalidArgument when message exceeds 2000 characters", async () => {
    await expect(
      sendContactMessage({
        name: "Grace",
        email: "grace@example.com",
        message: "x".repeat(2001),
      })
    ).rejects.toThrow();
  });

  test("accepts a message exactly 2000 characters long", async () => {
    const result = await sendContactMessage({
      name: "Hank",
      email: "hank@example.com",
      message: "x".repeat(2000),
    });

    expect(result.success).toBe(true);
  });
});
