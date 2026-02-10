-- Insert default admin user
-- Username: admin
-- Password: 123456 (bcrypt hashed)
-- IMPORTANT: Change the password after first login!

INSERT INTO `admin_users` (`username`, `password_hash`)
VALUES ('admin', '$2b$12$FgsRoN/SH5UfEof.ZcIjQ.FrpEUsvxz/n1yMuSskpo9pyZUxk.Gg6')
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`);
