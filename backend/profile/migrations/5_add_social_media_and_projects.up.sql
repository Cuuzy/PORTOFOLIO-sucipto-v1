-- Create social media table
CREATE TABLE social_media (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT,
  demo_url TEXT,
  github_url TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample social media data
INSERT INTO social_media (platform, url, username) VALUES 
('Instagram', 'https://instagram.com/ilhamsetiabhakti', '@ilhamsetiabhakti'),
('LinkedIn', 'https://linkedin.com/in/ilhamsetiabhakti', 'ilhamsetiabhakti'),
('GitHub', 'https://github.com/ilhamsetiabhakti', 'ilhamsetiabhakti'),
('Website', 'https://ilhamsetiabhakti.com', 'Portfolio');

-- Insert sample projects
INSERT INTO projects (title, description, technologies, demo_url, github_url, featured) VALUES 
('HR Management System', 'Comprehensive HR management system with employee tracking, payroll, and performance management features.', 'PHP, Laravel, MySQL, Bootstrap', 'https://demo-hr.example.com', 'https://github.com/example/hr-system', true),
('E-Learning Platform', 'Interactive e-learning platform with course management, video streaming, and progress tracking.', 'React, Node.js, MongoDB, Socket.io', 'https://demo-elearning.example.com', 'https://github.com/example/elearning', true),
('Company Profile Website', 'Modern responsive company profile website with CMS integration and SEO optimization.', 'WordPress, PHP, MySQL, JavaScript', 'https://demo-company.example.com', null, true);
