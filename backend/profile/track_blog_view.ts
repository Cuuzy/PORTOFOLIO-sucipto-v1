import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";

export interface TrackBlogViewResponse {
  view_count: number;
}

export const trackBlogView = api(
  { method: "POST", path: "/blog/:slug/view", expose: true },
  async ({ slug }: { slug: string }): Promise<TrackBlogViewResponse> => {
    const row = await profileDB.queryRow<{ view_count: number }>`
      UPDATE blog_posts
      SET view_count = view_count + 1
      WHERE slug = ${slug} AND published = true
      RETURNING view_count
    `;

    if (!row) {
      throw APIError.notFound("Blog post not found");
    }

    return { view_count: row.view_count };
  }
);
