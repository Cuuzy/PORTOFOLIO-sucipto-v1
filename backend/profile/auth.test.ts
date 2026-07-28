import { describe, expect, test, beforeEach } from "vitest";
import { login, verifyToken } from "./auth";
import { profileDB } from "./db";

describe("login", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM admins`;
  });

  test("returns a token for valid credentials", async () => {
    const result = await login({ username: "ito", password: "ito31102002" });

    expect(result.success).toBe(true);
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
  });

  test("token decodes to correct username and recent timestamp", async () => {
    const before = Date.now();
    const result = await login({ username: "ito", password: "ito31102002" });
    const after = Date.now();

    const decoded = Buffer.from(result.token, "base64").toString();
    const [username, timestamp] = decoded.split(":");
    const ts = parseInt(timestamp);

    expect(username).toBe("ito");
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  test("creates admin row in database on first login", async () => {
    await login({ username: "ito", password: "ito31102002" });

    const row = await profileDB.queryRow<{ username: string }>`
      SELECT username FROM admins WHERE username = 'ito'
    `;
    expect(row).not.toBeNull();
    expect(row!.username).toBe("ito");
  });

  test("is idempotent — does not create duplicate admin rows on repeated login", async () => {
    await login({ username: "ito", password: "ito31102002" });
    await login({ username: "ito", password: "ito31102002" });

    const rows = await profileDB.queryAll<{ username: string }>`
      SELECT username FROM admins WHERE username = 'ito'
    `;
    expect(rows).toHaveLength(1);
  });

  test("throws unauthenticated for wrong password", async () => {
    await expect(login({ username: "ito", password: "wrongpassword" })).rejects.toThrow();
  });

  test("throws unauthenticated for wrong username", async () => {
    await expect(login({ username: "admin", password: "ito31102002" })).rejects.toThrow();
  });
});

describe("verifyToken", () => {
  test("returns valid: true for a freshly issued token", async () => {
    await profileDB.exec`DELETE FROM admins`;
    const { token } = await login({ username: "ito", password: "ito31102002" });

    const result = await verifyToken({ token });
    expect(result.valid).toBe(true);
  });

  test("returns valid: false for an expired token", async () => {
    const pastTimestamp = Date.now() - 25 * 60 * 60 * 1000;
    const expiredToken = Buffer.from(`ito:${pastTimestamp}`).toString("base64");

    const result = await verifyToken({ token: expiredToken });
    expect(result.valid).toBe(false);
  });

  test("returns valid: false for a tampered token", async () => {
    const result = await verifyToken({ token: "not-a-valid-base64-token" });
    expect(result.valid).toBe(false);
  });

  test("returns valid: false for a token with wrong username", async () => {
    const fakeToken = Buffer.from(`hacker:${Date.now()}`).toString("base64");

    const result = await verifyToken({ token: fakeToken });
    expect(result.valid).toBe(false);
  });
});
