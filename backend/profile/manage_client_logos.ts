import { api, Header } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface ClientLogo {
  id: number;
  companyName: string;
  logoUrl: string;
  websiteUrl?: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  createdAt: Date;
}

export interface CreateClientLogoRequest {
  companyName: string;
  logoUrl: string;
  websiteUrl?: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateClientLogoRequest {
  id: number;
  companyName?: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface ClientLogosResponse {
  logos: ClientLogo[];
}

// Gets all active client logos
export const getClientLogos = api<void, ClientLogosResponse>(
  { expose: true, method: "GET", path: "/profile/client-logos" },
  async () => {
    const logos = await profileDB.queryAll<ClientLogo>`
      SELECT 
        id, 
        company_name as "companyName", 
        logo_url as "logoUrl", 
        website_url as "websiteUrl",
        description,
        display_order as "displayOrder",
        active,
        created_at as "createdAt"
      FROM client_logos
      WHERE active = true
      ORDER BY display_order ASC, created_at DESC
    `;

    return { logos };
  }
);

export interface GetAllClientLogosRequest {
  authorization?: Header<"Authorization">;
}

// Gets all client logos (admin only)
export const getAllClientLogos = api(
  { expose: true, method: "GET", path: "/profile/client-logos/all" },
  async (req: GetAllClientLogosRequest): Promise<ClientLogosResponse> => {
    const logos = await profileDB.queryAll<ClientLogo>`
      SELECT 
        id, 
        company_name as "companyName", 
        logo_url as "logoUrl", 
        website_url as "websiteUrl",
        description,
        display_order as "displayOrder",
        active,
        created_at as "createdAt"
      FROM client_logos
      ORDER BY display_order ASC, created_at DESC
    `;

    return { logos };
  }
);

// Creates a new client logo
export const createClientLogo = api(
  { expose: true, method: "POST", path: "/profile/client-logos" },
  async (req: CreateClientLogoRequest): Promise<ClientLogo> => {
    const logo = await profileDB.queryRow<ClientLogo>`
      INSERT INTO client_logos (company_name, logo_url, website_url, description, display_order)
      VALUES (${req.companyName}, ${req.logoUrl}, ${req.websiteUrl || null}, ${req.description || null}, ${req.displayOrder || 0})
      RETURNING 
        id, 
        company_name as "companyName", 
        logo_url as "logoUrl", 
        website_url as "websiteUrl",
        description,
        display_order as "displayOrder",
        active,
        created_at as "createdAt"
    `;

    if (!logo) throw new Error("Failed to create client logo");
    return logo;
  }
);

// Updates a client logo
export const updateClientLogo = api(
  { expose: true, method: "PUT", path: "/profile/client-logos/:id" },
  async (req: UpdateClientLogoRequest): Promise<ClientLogo> => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM client_logos WHERE id = ${req.id}`,
      "Client logo"
    );
    const logo = await profileDB.queryRow<ClientLogo>`
      UPDATE client_logos
      SET 
        company_name = COALESCE(${req.companyName || null}, company_name),
        logo_url = COALESCE(${req.logoUrl || null}, logo_url),
        website_url = COALESCE(${req.websiteUrl || null}, website_url),
        description = COALESCE(${req.description || null}, description),
        display_order = COALESCE(${req.displayOrder ?? null}, display_order),
        active = COALESCE(${req.active ?? null}, active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
      RETURNING 
        id, 
        company_name as "companyName", 
        logo_url as "logoUrl", 
        website_url as "websiteUrl",
        description,
        display_order as "displayOrder",
        active,
        created_at as "createdAt"
    `;
    if (!logo) throw new Error("Failed to update client logo");
    return logo;
  }
);

// Deletes a client logo
export const deleteClientLogo = api(
  { expose: true, method: "DELETE", path: "/profile/client-logos/:id" },
  async (req: { id: number }): Promise<void> => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM client_logos WHERE id = ${req.id}`,
      "Client logo"
    );
    await profileDB.exec`
      DELETE FROM client_logos WHERE id = ${req.id}
    `;
  }
);
