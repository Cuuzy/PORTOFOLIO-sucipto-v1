-- Add sample communication skill with 95% proficiency
INSERT INTO skills (name, percentage, category) VALUES 
('Komunikasi Efektif', 95, 'management');

-- Update some existing skills for better demonstration
UPDATE skills SET percentage = 88 WHERE name = 'Rekrutmen & Seleksi';
UPDATE skills SET percentage = 92 WHERE name = 'Pelatihan & Pengembangan';
UPDATE skills SET percentage = 78 WHERE name = 'Manajemen Kinerja';
UPDATE skills SET percentage = 85 WHERE name = 'Kompensasi & Benefit';
