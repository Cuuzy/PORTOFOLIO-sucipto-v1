import { api } from "encore.dev/api";
import { profileDB } from "./db";

export const generateSitemap = api.raw(
  { method: "GET", path: "/sitemap.xml", expose: true },
  async (req, resp) => {
    const baseUrl = 'https://proj-d2lgdks82vjjq79t7rt0.lp.dev';

    const blogPosts = await profileDB.queryAll<{ slug: string; updated_at: Date }>`
      SELECT slug, updated_at FROM blog_posts WHERE published = true ORDER BY updated_at DESC
    `;

    const currentDate = new Date().toISOString();

    const urls = [
      {
        loc: baseUrl,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: '1.0'
      },
      {
        loc: `${baseUrl}/blog`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.8'
      },
      ...blogPosts.map(post => ({
        loc: `${baseUrl}/blog/${post.slug}`,
        lastmod: new Date(post.updated_at).toISOString(),
        changefreq: 'monthly',
        priority: '0.7'
      }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    resp.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
    resp.end(sitemap);
  }
);

export const generateRobotsTxt = api.raw(
  { method: "GET", path: "/robots.txt", expose: true },
  async (req, resp) => {
    const baseUrl = 'https://proj-d2lgdks82vjjq79t7rt0.lp.dev';

    const content = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml`;

    resp.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    resp.end(content);
  }
);
