import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { profileDB } from "./db";

const resendApiKey = secret("ResendApiKey");
const ownerEmail = secret("OwnerEmail");

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  created_at: Date;
  replied_at?: Date;
  ip_address?: string;
}

export interface SendContactMessageRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface UpdateContactMessageStatusRequest {
  id: number;
  status: string;
}

export interface ListContactMessagesResponse {
  messages: ContactMessage[];
  total: number;
  unread_count: number;
}

export interface ListContactMessagesRequest {
  limit?: number;
  offset?: number;
  status?: string;
}

export const sendContactMessage = api(
  { method: "POST", path: "/contact", expose: true },
  async (req: SendContactMessageRequest): Promise<{ success: boolean; message: string }> => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.email)) {
      throw APIError.invalidArgument("Invalid email format");
    }

    // Validate required fields
    if (!req.name.trim() || !req.message.trim()) {
      throw APIError.invalidArgument("Name and message are required");
    }

    if (req.message.length > 2000) {
      throw APIError.invalidArgument("Message is too long (max 2000 characters)");
    }

    try {
      await profileDB.exec`
        INSERT INTO contact_messages (name, email, subject, message, ip_address)
        VALUES (${req.name.trim()}, ${req.email.trim()}, ${req.subject?.trim() || null}, ${req.message.trim()}, ${'unknown'})
      `;

      try {
        const subject = req.subject?.trim() || "(No Subject)";
        const emailBody = `
<h2>New Contact Form Message</h2>
<p><strong>From:</strong> ${req.name.trim()} &lt;${req.email.trim()}&gt;</p>
<p><strong>Subject:</strong> ${subject}</p>
<hr />
<p>${req.message.trim().replace(/\n/g, "<br />")}</p>
        `.trim();

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Contact Form <onboarding@resend.dev>",
            to: [ownerEmail()],
            reply_to: req.email.trim(),
            subject: `[Contact Form] ${subject}`,
            html: emailBody,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          console.error("Failed to send email notification:", err);
        }
      } catch (emailError) {
        console.error("Email notification error:", emailError);
      }

      return {
        success: true,
        message: "Pesan Anda telah terkirim! Saya akan membalas dalam 1-2 hari kerja."
      };
    } catch (error) {
      console.error('Failed to save contact message:', error);
      throw APIError.internal("Failed to send message");
    }
  }
);

export const listContactMessages = api(
  { method: "GET", path: "/admin/contact", auth: true, expose: true },
  async (req: ListContactMessagesRequest): Promise<ListContactMessagesResponse> => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    
    let whereClause = "";
    const params: (string | number)[] = [];
    
    if (req.status) {
      whereClause = " WHERE status = $1";
      params.push(req.status);
    }

    const messages = await profileDB.rawQueryAll<ContactMessage>(
      `SELECT * FROM contact_messages${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      ...params, limit, offset
    );

    const totalResult = await profileDB.rawQueryRow<{ count: number }>(
      `SELECT COUNT(*) as count FROM contact_messages${whereClause}`,
      ...params
    );

    const unreadResult = await profileDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'
    `;

    return {
      messages,
      total: totalResult?.count || 0,
      unread_count: unreadResult?.count || 0
    };
  }
);

export const updateContactMessageStatus = api(
  { method: "PUT", path: "/admin/contact/:id/status", auth: true, expose: true },
  async ({ id, status }: UpdateContactMessageStatusRequest): Promise<ContactMessage> => {
    const validStatuses = ['unread', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      throw APIError.invalidArgument("Invalid status");
    }

    const existing = await profileDB.queryRow<ContactMessage>`
      SELECT * FROM contact_messages WHERE id = ${id}
    `;

    if (!existing) {
      throw APIError.notFound("Contact message not found");
    }

    const repliedAt = status === 'replied' ? new Date() : existing.replied_at;

    const updated = await profileDB.queryRow<ContactMessage>`
      UPDATE contact_messages 
      SET status = ${status}, replied_at = ${repliedAt}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      throw APIError.internal("Failed to update contact message");
    }

    return updated;
  }
);

export const deleteContactMessage = api(
  { method: "DELETE", path: "/admin/contact/:id", auth: true, expose: true },
  async ({ id }: { id: number }): Promise<void> => {
    const existing = await profileDB.queryRow`
      SELECT id FROM contact_messages WHERE id = ${id}
    `;

    if (!existing) {
      throw APIError.notFound("Contact message not found");
    }

    await profileDB.exec`DELETE FROM contact_messages WHERE id = ${id}`;
  }
);

export interface ReplyContactMessageRequest {
  id: number;
  subject: string;
  body: string;
}

export const replyContactMessage = api(
  { method: "POST", path: "/admin/contact/:id/reply", auth: true, expose: true },
  async (req: ReplyContactMessageRequest): Promise<ContactMessage> => {
    if (!req.subject.trim() || !req.body.trim()) {
      throw APIError.invalidArgument("Subject and body are required");
    }

    const message = await profileDB.queryRow<ContactMessage>`
      SELECT * FROM contact_messages WHERE id = ${req.id}
    `;

    if (!message) {
      throw APIError.notFound("Contact message not found");
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Portfolio <onboarding@resend.dev>`,
          to: [message.email],
          reply_to: ownerEmail(),
          subject: req.subject.trim(),
          html: req.body.trim().replace(/\n/g, "<br />"),
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Failed to send reply email:", err);
      }
    } catch (emailError) {
      console.error("Reply email error:", emailError);
    }

    const updated = await profileDB.queryRow<ContactMessage>`
      UPDATE contact_messages
      SET status = 'replied', replied_at = NOW()
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!updated) {
      throw APIError.internal("Failed to update contact message status");
    }

    return updated;
  }
);

export const getContactMessage = api(
  { method: "GET", path: "/admin/contact/:id", auth: true, expose: true },
  async ({ id }: { id: number }): Promise<ContactMessage> => {
    const message = await profileDB.queryRow<ContactMessage>`
      SELECT * FROM contact_messages WHERE id = ${id}
    `;

    if (!message) {
      throw APIError.notFound("Contact message not found");
    }

    // Mark as read when viewed
    if (message.status === 'unread') {
      await profileDB.exec`
        UPDATE contact_messages SET status = 'read' WHERE id = ${id}
      `;
      message.status = 'read';
    }

    return message;
  }
);