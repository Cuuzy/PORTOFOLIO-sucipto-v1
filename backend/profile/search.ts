import { api } from "encore.dev/api";
import { profileDB } from "./db";

export interface SearchRequest {
  q: string;
}

export interface BlogPostResult {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  category: string;
  published_at?: Date;
}

export interface ProjectResult {
  id: number;
  title: string;
  description: string;
  technologies?: string;
}

export interface SearchResponse {
  blogPosts: BlogPostResult[];
  projects: ProjectResult[];
}

export const search = api(
  { method: "GET", path: "/search", expose: true },
  async ({ q }: SearchRequest): Promise<SearchResponse> => {
    if (!q || q.trim().length === 0) {
      return { blogPosts: [], projects: [] };
    }

    const term = `%${q.trim()}%`;

    const blogPosts = await profileDB.rawQueryAll<BlogPostResult>(
      `SELECT id, title, slug, excerpt, category, published_at
       FROM blog_posts
       WHERE published = true
         AND (
           title ILIKE $1
           OR excerpt ILIKE $1
           OR content ILIKE $1
           OR EXISTS (
             SELECT 1 FROM unnest(tags) t WHERE t ILIKE $1
           )
         )
       ORDER BY published_at DESC
       LIMIT 10`,
      term
    );

    const projects = await profileDB.rawQueryAll<ProjectResult>(
      `SELECT id, title, description, technologies
       FROM projects
       WHERE title ILIKE $1
          OR description ILIKE $1
          OR technologies ILIKE $1
       ORDER BY created_at DESC
       LIMIT 10`,
      term
    );

    return { blogPosts, projects };
  }
);
