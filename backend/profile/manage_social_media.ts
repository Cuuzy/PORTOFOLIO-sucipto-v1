import { api } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface CreateSocialMediaRequest {
  platform: string;
  url: string;
  username?: string;
}

export interface UpdateSocialMediaRequest {
  id: number;
  platform: string;
  url: string;
  username?: string;
}

export interface DeleteSocialMediaRequest {
  id: number;
}

export interface SocialMediaResponse {
  success: boolean;
}

// Creates a new social media link
export const createSocialMedia = api<CreateSocialMediaRequest, SocialMediaResponse>(
  { expose: true, method: "POST", path: "/social-media" },
  async (req) => {
    await profileDB.exec`
      INSERT INTO social_media (platform, url, username)
      VALUES (${req.platform}, ${req.url}, ${req.username ?? null})
    `;
    return { success: true };
  }
);

// Updates an existing social media link
export const updateSocialMedia = api<UpdateSocialMediaRequest, SocialMediaResponse>(
  { expose: true, method: "PUT", path: "/social-media/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM social_media WHERE id = ${req.id}`,
      "Social media"
    );
    await profileDB.exec`
      UPDATE social_media
      SET platform = ${req.platform},
          url = ${req.url},
          username = ${req.username ?? null}
      WHERE id = ${req.id}
    `;
    return { success: true };
  }
);

// Deletes a social media link
export const deleteSocialMedia = api<DeleteSocialMediaRequest, SocialMediaResponse>(
  { expose: true, method: "DELETE", path: "/social-media/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM social_media WHERE id = ${req.id}`,
      "Social media"
    );
    await profileDB.exec`
      DELETE FROM social_media WHERE id = ${req.id}
    `;
    return { success: true };
  }
);
