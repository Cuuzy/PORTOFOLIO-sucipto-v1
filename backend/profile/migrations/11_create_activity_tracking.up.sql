CREATE TABLE activity_tracking (
  id BIGSERIAL PRIMARY KEY,
  activity_type TEXT NOT NULL,
  description TEXT,
  visitor_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_tracking_type ON activity_tracking(activity_type);
CREATE INDEX idx_activity_tracking_created_at ON activity_tracking(created_at DESC);

CREATE TABLE client_logos (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_client_logos_active ON client_logos(active);
CREATE INDEX idx_client_logos_order ON client_logos(display_order);
