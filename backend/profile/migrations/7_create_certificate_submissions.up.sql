CREATE TABLE certificate_submissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  certificate_title TEXT NOT NULL,
  certificate_file_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP
);

CREATE INDEX idx_certificate_submissions_status ON certificate_submissions(status);
CREATE INDEX idx_certificate_submissions_created_at ON certificate_submissions(created_at DESC);
