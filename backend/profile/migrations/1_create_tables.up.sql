CREATE TABLE profiles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE education (
  id BIGSERIAL PRIMARY KEY,
  institution TEXT NOT NULL,
  location TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certificates (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  description TEXT,
  issue_date TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tools (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default profile data
INSERT INTO profiles (name, title, location, email, phone, photo_url) VALUES 
('Ilham Setia Bhakti', 'Web Developer | Content Creator', 'Bekasi', 'isetiabhakti@gmail.com', '+62 899-8994-858', '/api/profile/photo');

-- Insert default skills
INSERT INTO skills (name, percentage, category) VALUES 
('Web Based Programming', 95, 'programming'),
('Multimedia', 80, 'design'),
('Networking', 75, 'technical'),
('Blog + SEO', 50, 'marketing'),
('Office', 50, 'productivity'),
('PHP', 100, 'language');

-- Insert default education
INSERT INTO education (institution, location, start_year, end_year) VALUES 
('SDIT Assalam', 'Bekasi', 2005, 2011),
('SMPN 11 Kota Bekasi', 'Bekasi', 2011, 2014),
('SMAN 1 Tambun Utara', 'Bekasi', 2014, 2017),
('Universitas Bhayangkara', 'Bekasi', 2018, 2022);

-- Insert default certificates
INSERT INTO certificates (title, issuer, description, issue_date) VALUES 
('Oracle Application Express (APEX) Hands On Lab', 'Oracle', 'Pengelan dasar-dasar penggunaan software Oracle APEX.', 'Oktober 2019');

-- Insert default tools
INSERT INTO tools (name) VALUES 
('CodeIgniter'),
('Laravel'),
('React'),
('Node.js');

-- Insert default admin (password: admin123)
INSERT INTO admins (username, password_hash) VALUES 
('admin', '$2b$10$rOzJqQZ8qVqKqVqKqVqKqOzJqQZ8qVqKqVqKqVqKqOzJqQZ8qVqKq');
