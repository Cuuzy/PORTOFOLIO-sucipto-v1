import { describe, expect, test, beforeEach } from "vitest";
import { createBlogPost, updateBlogPost, deleteBlogPost, getBlogPost, listBlogPosts } from "./manage_blog";
import { profileDB } from "./db";

describe("blog post CRUD", () => {
  beforeEach(async () => {
    await profileDB.exec`DELETE FROM blog_posts`;
  });

  describe("createBlogPost", () => {
    test("creates a blog post and returns it with an id", async () => {
      const post = await createBlogPost({
        title: "My First Post",
        slug: "my-first-post",
        content: "Hello world content here.",
        category: "tech",
        tags: ["intro", "hello"],
      });

      expect(post.id).toBeDefined();
      expect(post.title).toBe("My First Post");
      expect(post.slug).toBe("my-first-post");
      expect(post.content).toBe("Hello world content here.");
      expect(post.category).toBe("tech");
      expect(post.tags).toEqual(["intro", "hello"]);
    });

    test("persists the post to the database", async () => {
      const post = await createBlogPost({
        title: "Persisted Post",
        slug: "persisted-post",
        content: "Some content.",
      });

      const row = await profileDB.queryRow<{ title: string; slug: string }>`
        SELECT title, slug FROM blog_posts WHERE id = ${post.id}
      `;
      expect(row).not.toBeNull();
      expect(row!.title).toBe("Persisted Post");
      expect(row!.slug).toBe("persisted-post");
    });

    test("defaults published to false", async () => {
      const post = await createBlogPost({
        title: "Draft Post",
        slug: "draft-post",
        content: "Draft content.",
      });

      expect(post.published).toBe(false);
      expect(post.published_at).toBeNull();
    });

    test("sets published_at when created as published", async () => {
      const before = new Date();
      const post = await createBlogPost({
        title: "Live Post",
        slug: "live-post",
        content: "Live content.",
        published: true,
      });
      const after = new Date();

      expect(post.published).toBe(true);
      expect(post.published_at).not.toBeNull();
      expect(new Date(post.published_at!).getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(new Date(post.published_at!).getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test("calculates read_time_minutes from content word count", async () => {
      const words = Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ");
      const post = await createBlogPost({
        title: "Long Post",
        slug: "long-post",
        content: words,
      });

      expect(post.read_time_minutes).toBe(2);
    });

    test("uses default category 'general' when not provided", async () => {
      const post = await createBlogPost({
        title: "No Category Post",
        slug: "no-category-post",
        content: "Content.",
      });

      expect(post.category).toBe("general");
    });

    test("generates slug from title when slug is not provided", async () => {
      const post = await createBlogPost({
        title: "Auto Slug Title",
        slug: "",
        content: "Content.",
      });

      expect(post.slug).toBe("auto-slug-title");
    });
  });

  describe("updateBlogPost", () => {
    test("updates title and content", async () => {
      const created = await createBlogPost({
        title: "Original Title",
        slug: "original-title",
        content: "Original content.",
      });

      const updated = await updateBlogPost({
        id: created.id,
        title: "Updated Title",
        content: "Updated content.",
      });

      expect(updated.title).toBe("Updated Title");
      expect(updated.content).toBe("Updated content.");
    });

    test("persists updates to the database", async () => {
      const created = await createBlogPost({
        title: "Before Update",
        slug: "before-update",
        content: "Before.",
      });

      await updateBlogPost({ id: created.id, title: "After Update" });

      const row = await profileDB.queryRow<{ title: string }>`
        SELECT title FROM blog_posts WHERE id = ${created.id}
      `;
      expect(row!.title).toBe("After Update");
    });

    test("sets published_at when transitioning from unpublished to published", async () => {
      const created = await createBlogPost({
        title: "Draft to Live",
        slug: "draft-to-live",
        content: "Content.",
        published: false,
      });

      const before = new Date();
      const updated = await updateBlogPost({ id: created.id, published: true });
      const after = new Date();

      expect(updated.published).toBe(true);
      expect(updated.published_at).not.toBeNull();
      expect(new Date(updated.published_at!).getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(new Date(updated.published_at!).getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test("does not overwrite published_at when already published", async () => {
      const created = await createBlogPost({
        title: "Already Live",
        slug: "already-live",
        content: "Content.",
        published: true,
      });
      const originalPublishedAt = created.published_at;

      const updated = await updateBlogPost({ id: created.id, title: "New Title" });

      expect(updated.published_at?.toString()).toBe(originalPublishedAt?.toString());
    });

    test("recalculates read_time_minutes when content changes", async () => {
      const created = await createBlogPost({
        title: "Short Post",
        slug: "short-post",
        content: "Short.",
      });
      expect(created.read_time_minutes).toBe(1);

      const words = Array.from({ length: 600 }, (_, i) => `word${i}`).join(" ");
      const updated = await updateBlogPost({ id: created.id, content: words });

      expect(updated.read_time_minutes).toBe(3);
    });

    test("throws not found for non-existent post", async () => {
      await expect(updateBlogPost({ id: 999999, title: "Ghost" })).rejects.toThrow();
    });
  });

  describe("deleteBlogPost", () => {
    test("deletes an existing post", async () => {
      const created = await createBlogPost({
        title: "To Be Deleted",
        slug: "to-be-deleted",
        content: "Content.",
      });

      await deleteBlogPost({ id: created.id });

      const row = await profileDB.queryRow`SELECT id FROM blog_posts WHERE id = ${created.id}`;
      expect(row).toBeNull();
    });

    test("throws not found when post does not exist", async () => {
      await expect(deleteBlogPost({ id: 999999 })).rejects.toThrow();
    });

    test("only deletes the targeted post", async () => {
      const post1 = await createBlogPost({ title: "Post 1", slug: "post-1", content: "Content 1." });
      await createBlogPost({ title: "Post 2", slug: "post-2", content: "Content 2." });

      await deleteBlogPost({ id: post1.id });

      const remaining = await profileDB.queryAll<{ title: string }>`SELECT title FROM blog_posts`;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].title).toBe("Post 2");
    });
  });

  describe("getBlogPost", () => {
    test("returns the post by id", async () => {
      const created = await createBlogPost({
        title: "Fetch Me",
        slug: "fetch-me",
        content: "Content.",
      });

      const fetched = await getBlogPost({ id: created.id });

      expect(fetched.id).toBe(created.id);
      expect(fetched.title).toBe("Fetch Me");
    });

    test("throws not found for non-existent post", async () => {
      await expect(getBlogPost({ id: 999999 })).rejects.toThrow();
    });
  });

  describe("listBlogPosts", () => {
    test("returns all posts with correct pagination metadata", async () => {
      await createBlogPost({ title: "Post A", slug: "post-a", content: "Content." });
      await createBlogPost({ title: "Post B", slug: "post-b", content: "Content." });
      await createBlogPost({ title: "Post C", slug: "post-c", content: "Content." });

      const result = await listBlogPosts({ limit: 2, offset: 0 });

      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(true);
      expect(result.currentPage).toBe(1);
    });

    test("returns second page correctly", async () => {
      await createBlogPost({ title: "Post A", slug: "post-a", content: "Content." });
      await createBlogPost({ title: "Post B", slug: "post-b", content: "Content." });
      await createBlogPost({ title: "Post C", slug: "post-c", content: "Content." });

      const result = await listBlogPosts({ limit: 2, offset: 2 });

      expect(result.posts).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(false);
      expect(result.currentPage).toBe(2);
    });

    test("returns empty list when no posts exist", async () => {
      const result = await listBlogPosts({});

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    test("filters by published_only", async () => {
      await createBlogPost({ title: "Draft", slug: "draft", content: "Content.", published: false });
      await createBlogPost({ title: "Live", slug: "live", content: "Content.", published: true });

      const result = await listBlogPosts({ published_only: true });

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe("Live");
    });
  });
});
