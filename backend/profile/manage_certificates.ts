import { api } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface CreateCertificateRequest {
  title: string;
  issuer: string;
  description?: string;
  issueDate: string;
  imageUrl?: string;
}

export interface UpdateCertificateRequest {
  id: number;
  title: string;
  issuer: string;
  description?: string;
  issueDate: string;
  imageUrl?: string;
}

export interface DeleteCertificateRequest {
  id: number;
}

export interface CertificateResponse {
  success: boolean;
}

// Creates a new certificate
export const createCertificate = api<CreateCertificateRequest, CertificateResponse>(
  { expose: true, method: "POST", path: "/certificates" },
  async (req) => {
    await profileDB.exec`
      INSERT INTO certificates (title, issuer, description, issue_date, image_url)
      VALUES (${req.title}, ${req.issuer}, ${req.description ?? null}, ${req.issueDate}, ${req.imageUrl ?? null})
    `;
    return { success: true };
  }
);

// Updates an existing certificate
export const updateCertificate = api<UpdateCertificateRequest, CertificateResponse>(
  { expose: true, method: "PUT", path: "/certificates/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM certificates WHERE id = ${req.id}`,
      "Certificate"
    );
    await profileDB.exec`
      UPDATE certificates
      SET title = ${req.title},
          issuer = ${req.issuer},
          description = ${req.description ?? null},
          issue_date = ${req.issueDate},
          image_url = ${req.imageUrl ?? null}
      WHERE id = ${req.id}
    `;
    return { success: true };
  }
);

// Deletes a certificate
export const deleteCertificate = api<DeleteCertificateRequest, CertificateResponse>(
  { expose: true, method: "DELETE", path: "/certificates/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM certificates WHERE id = ${req.id}`,
      "Certificate"
    );
    await profileDB.exec`
      DELETE FROM certificates WHERE id = ${req.id}
    `;
    return { success: true };
  }
);
