import { api } from "encore.dev/api";
import { profileDB } from "./db";

export interface SubmitCertificateRequest {
  name: string;
  email: string;
  certificateTitle: string;
  certificateFileUrl?: string;
  description?: string;
}

export interface CertificateSubmission {
  id: number;
  name: string;
  email: string;
  certificateTitle: string;
  certificateFileUrl: string | null;
  description: string | null;
  status: string;
  createdAt: Date;
  reviewedAt: Date | null;
}

export interface CertificateSubmissionResponse {
  success: boolean;
  message?: string;
}

export interface ListCertificateSubmissionsResponse {
  submissions: CertificateSubmission[];
}

export interface UpdateSubmissionStatusRequest {
  id: number;
  status: string;
}

export const submitCertificate = api<SubmitCertificateRequest, CertificateSubmissionResponse>(
  { expose: true, method: "POST", path: "/certificates/submit" },
  async (req) => {
    if (!req.name || !req.email || !req.certificateTitle) {
      return { success: false, message: "Name, email, and certificate title are required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.email)) {
      return { success: false, message: "Invalid email address" };
    }

    await profileDB.exec`
      INSERT INTO certificate_submissions (name, email, certificate_title, certificate_file_url, description, status)
      VALUES (${req.name}, ${req.email}, ${req.certificateTitle}, ${req.certificateFileUrl ?? null}, ${req.description ?? null}, 'pending')
    `;

    return { 
      success: true, 
      message: "Certificate submission received! We'll review it shortly." 
    };
  }
);

export const listCertificateSubmissions = api<void, ListCertificateSubmissionsResponse>(
  { expose: true, auth: true, method: "GET", path: "/certificates/submissions" },
  async () => {
    const submissionsArray: CertificateSubmission[] = [];
    
    const submissions = await profileDB.query<CertificateSubmission>`
      SELECT 
        id, 
        name, 
        email, 
        certificate_title as "certificateTitle", 
        certificate_file_url as "certificateFileUrl", 
        description, 
        status, 
        created_at as "createdAt",
        reviewed_at as "reviewedAt"
      FROM certificate_submissions
      ORDER BY created_at DESC
    `;

    for await (const sub of submissions) {
      submissionsArray.push(sub);
    }

    return { submissions: submissionsArray };
  }
);

export const updateSubmissionStatus = api<UpdateSubmissionStatusRequest, CertificateSubmissionResponse>(
  { expose: true, auth: true, method: "PATCH", path: "/certificates/submissions/:id/status" },
  async (req) => {
    await profileDB.exec`
      UPDATE certificate_submissions
      SET status = ${req.status},
          reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
    `;

    return { success: true };
  }
);

export const deleteSubmission = api<{ id: number }, CertificateSubmissionResponse>(
  { expose: true, auth: true, method: "DELETE", path: "/certificates/submissions/:id" },
  async (req) => {
    await profileDB.exec`
      DELETE FROM certificate_submissions WHERE id = ${req.id}
    `;

    return { success: true };
  }
);
