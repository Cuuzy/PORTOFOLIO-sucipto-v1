CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  referrer TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  visitor_hash TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX idx_page_views_visitor_hash ON page_views(visitor_hash);
CREATE INDEX idx_page_views_date ON page_views(DATE(created_at));
