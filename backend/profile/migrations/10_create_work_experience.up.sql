CREATE TABLE work_experience (
  id BIGSERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  responsibilities TEXT[],
  achievements TEXT[],
  employment_type TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_experience_start_date ON work_experience(start_date DESC);
CREATE INDEX idx_work_experience_is_current ON work_experience(is_current);
