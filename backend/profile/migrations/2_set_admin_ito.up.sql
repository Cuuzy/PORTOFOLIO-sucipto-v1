-- Reset admins and set the fixed admin user as requested.
DELETE FROM admins;
INSERT INTO admins (username, password_hash)
VALUES ('ito', 'fixed-credential-login');
