import { api } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface Service {
  id: number;
  title: string;
  description: string;
  priceRange?: string;
  duration?: string;
  features: string[];
  iconUrl?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  priceRange?: string;
  duration?: string;
  features: string[];
  iconUrl?: string;
  active: boolean;
  sortOrder?: number;
}

export interface UpdateServiceRequest {
  id: number;
  title: string;
  description: string;
  priceRange?: string;
  duration?: string;
  features: string[];
  iconUrl?: string;
  active: boolean;
  sortOrder?: number;
}

export interface DeleteServiceRequest {
  id: number;
}

export interface ServiceResponse {
  success: boolean;
}

export interface ListServicesResponse {
  services: Service[];
}

function rowToService(row: Record<string, unknown>): Service {
  return {
    id: row.id as number,
    title: row.title as string,
    description: row.description as string,
    priceRange: (row.price_range as string) ?? undefined,
    duration: (row.duration as string) ?? undefined,
    features: (row.features as string[]) ?? [],
    iconUrl: (row.icon_url as string) ?? undefined,
    active: row.active as boolean,
    sortOrder: row.sort_order as number,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

export const listServices = api(
  { expose: true, method: "GET", path: "/services" },
  async (): Promise<ListServicesResponse> => {
    const rows = profileDB.query`
      SELECT id, title, description, price_range, duration, features, icon_url, active, sort_order, created_at, updated_at
      FROM services
      ORDER BY sort_order ASC, created_at ASC
    `;
    const services: Service[] = [];
    for await (const row of rows) {
      services.push(rowToService(row as Record<string, unknown>));
    }
    return { services };
  }
);

export const listActiveServices = api(
  { expose: true, method: "GET", path: "/services/active" },
  async (): Promise<ListServicesResponse> => {
    const rows = profileDB.query`
      SELECT id, title, description, price_range, duration, features, icon_url, active, sort_order, created_at, updated_at
      FROM services
      WHERE active = TRUE
      ORDER BY sort_order ASC, created_at ASC
    `;
    const services: Service[] = [];
    for await (const row of rows) {
      services.push(rowToService(row as Record<string, unknown>));
    }
    return { services };
  }
);

export const createService = api(
  { expose: true, method: "POST", path: "/services" },
  async (req: CreateServiceRequest): Promise<ServiceResponse> => {
    await profileDB.exec`
      INSERT INTO services (title, description, price_range, duration, features, icon_url, active, sort_order)
      VALUES (
        ${req.title}, ${req.description},
        ${req.priceRange ?? null}, ${req.duration ?? null},
        ${req.features}, ${req.iconUrl ?? null},
        ${req.active}, ${req.sortOrder ?? 0}
      )
    `;
    return { success: true };
  }
);

export const updateService = api(
  { expose: true, method: "PUT", path: "/services/:id" },
  async (req: UpdateServiceRequest): Promise<ServiceResponse> => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM services WHERE id = ${req.id}`,
      "Service"
    );
    await profileDB.exec`
      UPDATE services
      SET title = ${req.title},
          description = ${req.description},
          price_range = ${req.priceRange ?? null},
          duration = ${req.duration ?? null},
          features = ${req.features},
          icon_url = ${req.iconUrl ?? null},
          active = ${req.active},
          sort_order = ${req.sortOrder ?? 0},
          updated_at = NOW()
      WHERE id = ${req.id}
    `;
    return { success: true };
  }
);

export const deleteService = api(
  { expose: true, method: "DELETE", path: "/services/:id" },
  async (req: DeleteServiceRequest): Promise<ServiceResponse> => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM services WHERE id = ${req.id}`,
      "Service"
    );
    await profileDB.exec`DELETE FROM services WHERE id = ${req.id}`;
    return { success: true };
  }
);
