ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS challenges TEXT,
  ADD COLUMN IF NOT EXISTS solutions TEXT,
  ADD COLUMN IF NOT EXISTS outcomes TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[],
  ADD COLUMN IF NOT EXISTS client TEXT,
  ADD COLUMN IF NOT EXISTS duration TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT;

UPDATE projects SET
  challenges = 'Managing complex HR workflows across multiple departments with real-time data synchronization and legacy system integration.',
  solutions = 'Built a modular microservice-based architecture using Laravel with RESTful APIs, enabling seamless integration with existing payroll systems.',
  outcomes = 'Reduced HR processing time by 40%, improved employee satisfaction scores by 25%, and eliminated manual data entry errors completely.',
  gallery_images = ARRAY['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
  client = 'PT. Maju Bersama',
  duration = '6 months',
  role = 'Full Stack Developer'
WHERE title = 'HR Management System';

UPDATE projects SET
  challenges = 'Delivering high-quality video streaming with minimal latency across diverse network conditions while maintaining an engaging learning experience.',
  solutions = 'Implemented adaptive bitrate streaming using HLS, combined with a Socket.io-powered real-time discussion board and progress tracking system.',
  outcomes = 'Platform launched with 500+ enrolled students in the first month, achieving a 92% course completion rate and 4.8/5 average rating.',
  gallery_images = ARRAY['https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'],
  client = 'EduTech Indonesia',
  duration = '4 months',
  role = 'Lead Developer'
WHERE title = 'E-Learning Platform';

UPDATE projects SET
  challenges = 'Creating a performant, SEO-optimized website that non-technical staff could easily manage while reflecting the brand''s professional identity.',
  solutions = 'Developed a custom WordPress theme with ACF Pro for flexible content management, integrated schema markup, and automated image optimization.',
  outcomes = 'Achieved 95/100 Google PageSpeed score, 60% increase in organic traffic within 3 months, and empowered the client team to self-manage content.',
  gallery_images = ARRAY['https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800'],
  client = 'CV. Karya Digital',
  duration = '2 months',
  role = 'Web Developer'
WHERE title = 'Company Profile Website';
