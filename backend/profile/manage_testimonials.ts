import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface Testimonial {
  id: number;
  name: string;
  position?: string;
  company?: string;
  content: string;
  rating?: number;
  avatar_url?: string;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTestimonialRequest {
  name: string;
  position?: string;
  company?: string;
  content: string;
  rating?: number;
  avatar_url?: string;
  featured?: boolean;
}

export interface UpdateTestimonialRequest {
  id: number;
  name?: string;
  position?: string;
  company?: string;
  content?: string;
  rating?: number;
  avatar_url?: string;
  featured?: boolean;
}

export interface ListTestimonialsResponse {
  testimonials: Testimonial[];
  total: number;
}

export interface ListTestimonialsRequest {
  limit?: number;
  offset?: number;
  featured_only?: boolean;
}

export const createTestimonial = api(
  { method: "POST", path: "/admin/testimonials", auth: true, expose: true },
  async (req: CreateTestimonialRequest): Promise<Testimonial> => {
    if (!req.name.trim() || !req.content.trim()) {
      throw APIError.invalidArgument("Name and content are required");
    }

    if (req.rating && (req.rating < 1 || req.rating > 5)) {
      throw APIError.invalidArgument("Rating must be between 1 and 5");
    }

    const testimonial = await profileDB.queryRow<Testimonial>`
      INSERT INTO testimonials (
        name, position, company, content, rating, avatar_url, featured
      ) VALUES (
        ${req.name.trim()}, ${req.position?.trim() || null}, ${req.company?.trim() || null}, 
        ${req.content.trim()}, ${req.rating || null}, ${req.avatar_url || null}, 
        ${req.featured || false}
      ) 
      RETURNING *
    `;

    if (!testimonial) {
      throw APIError.internal("Failed to create testimonial");
    }

    return testimonial;
  }
);

export const updateTestimonial = api(
  { method: "PUT", path: "/admin/testimonials/:id", auth: true, expose: true },
  async ({ id, ...req }: UpdateTestimonialRequest): Promise<Testimonial> => {
    const existing = await findOrThrow(
      profileDB.queryRow<Testimonial>`SELECT * FROM testimonials WHERE id = ${id}`,
      "Testimonial"
    );

    if (req.rating && (req.rating < 1 || req.rating > 5)) {
      throw APIError.invalidArgument("Rating must be between 1 and 5");
    }

    const updates: {
      id: number;
      name: string;
      position?: string | null;
      company?: string | null;
      content: string;
      rating?: number | null;
      avatar_url?: string | null;
      featured: boolean;
      created_at: Date;
      updated_at: Date;
    } = { ...existing };
    if (req.name !== undefined) updates.name = req.name.trim();
    if (req.position !== undefined) updates.position = req.position?.trim() || null;
    if (req.company !== undefined) updates.company = req.company?.trim() || null;
    if (req.content !== undefined) updates.content = req.content.trim();
    if (req.rating !== undefined) updates.rating = req.rating;
    if (req.avatar_url !== undefined) updates.avatar_url = req.avatar_url || null;
    if (req.featured !== undefined) updates.featured = req.featured;
    updates.updated_at = new Date();

    if (!updates.name || !updates.content) {
      throw APIError.invalidArgument("Name and content are required");
    }

    const testimonial = await profileDB.queryRow<Testimonial>`
      UPDATE testimonials SET 
        name = ${updates.name},
        position = ${updates.position},
        company = ${updates.company},
        content = ${updates.content},
        rating = ${updates.rating},
        avatar_url = ${updates.avatar_url},
        featured = ${updates.featured},
        updated_at = ${updates.updated_at}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!testimonial) {
      throw APIError.internal("Failed to update testimonial");
    }

    return testimonial;
  }
);

export const deleteTestimonial = api(
  { method: "DELETE", path: "/admin/testimonials/:id", auth: true, expose: true },
  async ({ id }: { id: number }): Promise<void> => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM testimonials WHERE id = ${id}`,
      "Testimonial"
    );
    await profileDB.exec`DELETE FROM testimonials WHERE id = ${id}`;
  }
);

export const listTestimonials = api(
  { method: "GET", path: "/admin/testimonials", auth: true, expose: true },
  async (req: ListTestimonialsRequest): Promise<ListTestimonialsResponse> => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    
    let whereClause = "";
    const params: (string | number | boolean)[] = [];
    
    if (req.featured_only) {
      whereClause = " WHERE featured = true";
    }

    const testimonials = await profileDB.rawQueryAll<Testimonial>(
      `SELECT * FROM testimonials${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      ...params, limit, offset
    );

    const totalResult = await profileDB.rawQueryRow<{ count: number }>(
      `SELECT COUNT(*) as count FROM testimonials${whereClause}`,
      ...params
    );

    return {
      testimonials,
      total: totalResult?.count || 0
    };
  }
);

export const getTestimonial = api(
  { method: "GET", path: "/admin/testimonials/:id", auth: true, expose: true },
  async ({ id }: { id: number }): Promise<Testimonial> => {
    return findOrThrow(
      profileDB.queryRow<Testimonial>`SELECT * FROM testimonials WHERE id = ${id}`,
      "Testimonial"
    );
  }
);

export const getPublicTestimonials = api(
  { method: "GET", path: "/testimonials", expose: true },
  async (req: ListTestimonialsRequest): Promise<ListTestimonialsResponse> => {
    const limit = req.limit || 10;
    const offset = req.offset || 0;
    
    let orderBy = "created_at DESC";
    if (req.featured_only) {
      orderBy = "featured DESC, created_at DESC";
    }

    const testimonials = await profileDB.rawQueryAll<Testimonial>(
      `SELECT * FROM testimonials ORDER BY ${orderBy} LIMIT $1 OFFSET $2`,
      limit, offset
    );

    const totalResult = await profileDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM testimonials
    `;

    return {
      testimonials,
      total: totalResult?.count || 0
    };
  }
);