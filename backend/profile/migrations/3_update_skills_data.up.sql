-- Update existing skills to use better categories
UPDATE skills SET category = 'management' WHERE name = 'PHP';

-- Add some sample management skills
INSERT INTO skills (name, percentage, category) VALUES 
('Rekrutmen & Seleksi', 85, 'management'),
('Pelatihan & Pengembangan', 80, 'management'),
('Manajemen Kinerja', 75, 'management'),
('Kompensasi & Benefit', 70, 'management');
