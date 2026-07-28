import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  published: boolean;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
  read_time_minutes: number;
  view_count: number;
  category: string;
  tags: string[];
  draft_content?: string;
  draft_saved_at?: Date;
}

export interface CreateBlogPostRequest {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  published?: boolean;
  category?: string;
  tags?: string[];
}

export interface UpdateBlogPostRequest {
  id: number;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  published?: boolean;
  category?: string;
  tags?: string[];
  draft_content?: string;
}

export interface SaveDraftRequest {
  id: number;
  draft_content: string;
}

export interface ListBlogPostsResponse {
  posts: BlogPost[];
  total: number;
  hasMore: boolean;
  currentPage: number;
}

export interface ListBlogPostsRequest {
  limit?: number;
  offset?: number;
  published_only?: boolean;
  category?: string;
}

interface QueryBlogPostsParams {
  limit: number;
  offset: number;
  publishedOnly: boolean;
  category?: string;
  orderBy: "created_at" | "published_at";
}

async function queryBlogPosts(params: QueryBlogPostsParams): Promise<ListBlogPostsResponse> {
  const { limit, offset, publishedOnly, category, orderBy } = params;
  const sqlParams: (string | number | boolean)[] = [];

  let whereClause = "";

  if (publishedOnly) {
    whereClause += " WHERE published = true";
  }

  if (category) {
    whereClause += whereClause ? " AND" : " WHERE";
    whereClause += ` category = $${sqlParams.length + 1}`;
    sqlParams.push(category);
  }

  const posts = await profileDB.rawQueryAll<BlogPost>(
    `SELECT * FROM blog_posts${whereClause} ORDER BY ${orderBy} DESC LIMIT $${sqlParams.length + 1} OFFSET $${sqlParams.length + 2}`,
    ...sqlParams, limit, offset
  );

  const totalResult = await profileDB.rawQueryRow<{ count: number }>(
    `SELECT COUNT(*) as count FROM blog_posts${whereClause}`,
    ...sqlParams
  );

  const total = totalResult?.count || 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const hasMore = offset + posts.length < total;

  return { posts, total, hasMore, currentPage };
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const createBlogPost = api(
  { method: "POST", path: "/admin/blog", auth: true, expose: true },
  async (req: CreateBlogPostRequest): Promise<BlogPost> => {
    const readTime = calculateReadTime(req.content);
    const slug = req.slug || generateSlug(req.title);
    const publishedAt = req.published ? new Date() : null;

    const post = await profileDB.queryRow<BlogPost>`
      INSERT INTO blog_posts (
        title, slug, excerpt, content, featured_image, published, 
        published_at, read_time_minutes, category, tags
      ) VALUES (
        ${req.title}, ${slug}, ${req.excerpt || null}, ${req.content}, 
        ${req.featured_image || null}, ${req.published || false},
        ${publishedAt}, ${readTime}, ${req.category || 'general'}, 
        ${req.tags || []}
      ) 
      RETURNING *
    `;

    if (!post) {
      throw APIError.internal("Failed to create blog post");
    }

    return post;
  }
);

export const updateBlogPost = api(
  { method: "PUT", path: "/admin/blog/:id", auth: true, expose: true },
  async ({ id, ...req }: UpdateBlogPostRequest): Promise<BlogPost> => {
    const existing = await findOrThrow(
      profileDB.queryRow<BlogPost>`SELECT * FROM blog_posts WHERE id = ${id}`,
      "Blog post"
    );

    const updates: BlogPost = { ...existing };
    if (req.title !== undefined) updates.title = req.title;
    if (req.slug !== undefined) updates.slug = req.slug;
    if (req.excerpt !== undefined) updates.excerpt = req.excerpt;
    if (req.content !== undefined) {
      updates.content = req.content;
      updates.read_time_minutes = calculateReadTime(req.content);
    }
    if (req.featured_image !== undefined) updates.featured_image = req.featured_image;
    if (req.published !== undefined) {
      updates.published = req.published;
      if (req.published && !existing.published) {
        updates.published_at = new Date();
      }
    }
    if (req.category !== undefined) updates.category = req.category;
    if (req.tags !== undefined) updates.tags = req.tags;
    if (req.draft_content !== undefined) {
      updates.draft_content = req.draft_content;
      updates.draft_saved_at = new Date();
    }

    updates.updated_at = new Date();

    const post = await profileDB.queryRow<BlogPost>`
      UPDATE blog_posts SET 
        title = ${updates.title},
        slug = ${updates.slug},
        excerpt = ${updates.excerpt},
        content = ${updates.content},
        featured_image = ${updates.featured_image},
        published = ${updates.published},
        published_at = ${updates.published_at},
        read_time_minutes = ${updates.read_time_minutes},
        category = ${updates.category},
        tags = ${updates.tags},
        draft_content = ${updates.draft_content},
        draft_saved_at = ${updates.draft_saved_at},
        updated_at = ${updates.updated_at}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!post) {
      throw APIError.internal("Failed to update blog post");
    }

    return post;
  }
);

export const deleteBlogPost = api(
  { method: "DELETE", path: "/admin/blog/:id", auth: true, expose: true },
  async ({ id }: { id: number }): Promise<void> => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM blog_posts WHERE id = ${id}`,
      "Blog post"
    );
    await profileDB.exec`DELETE FROM blog_posts WHERE id = ${id}`;
  }
);

export const listBlogPosts = api(
  { method: "GET", path: "/admin/blog", auth: true, expose: true },
  async (req: ListBlogPostsRequest): Promise<ListBlogPostsResponse> => {
    return queryBlogPosts({
      limit: req.limit || 10,
      offset: req.offset || 0,
      publishedOnly: req.published_only || false,
      category: req.category,
      orderBy: "created_at",
    });
  }
);

export const getBlogPost = api(
  { method: "GET", path: "/admin/blog/:id", auth: true, expose: true },
  async ({ id }: { id: number }): Promise<BlogPost> => {
    return findOrThrow(
      profileDB.queryRow<BlogPost>`SELECT * FROM blog_posts WHERE id = ${id}`,
      "Blog post"
    );
  }
);

export const getPublicBlogPosts = api(
  { method: "GET", path: "/blog", expose: true },
  async (req: ListBlogPostsRequest): Promise<ListBlogPostsResponse> => {
    return queryBlogPosts({
      limit: req.limit || 10,
      offset: req.offset || 0,
      publishedOnly: true,
      category: req.category,
      orderBy: "published_at",
    });
  }
);

export const getPublicBlogPost = api(
  { method: "GET", path: "/blog/:slug", expose: true },
  async ({ slug }: { slug: string }): Promise<BlogPost> => {
    return findOrThrow(
      profileDB.queryRow<BlogPost>`SELECT * FROM blog_posts WHERE slug = ${slug} AND published = true`,
      "Blog post"
    );
  }
);

export const saveDraft = api(
  { method: "POST", path: "/admin/blog/:id/draft", auth: true, expose: true },
  async ({ id, draft_content }: SaveDraftRequest): Promise<{ saved_at: Date }> => {
    await findOrThrow(
      profileDB.queryRow<BlogPost>`SELECT id FROM blog_posts WHERE id = ${id}`,
      "Blog post"
    );
    const saved_at = new Date();

    await profileDB.exec`
      UPDATE blog_posts 
      SET draft_content = ${draft_content}, draft_saved_at = ${saved_at}
      WHERE id = ${id}
    `;

    return { saved_at };
  }
);
