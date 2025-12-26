-- Insert sample teams in Tasikmalaya and Ciamis
INSERT INTO teams (user_id, name, description, skill_level, contact_phone, city, address, location) VALUES
-- Tasikmalaya teams (lat: -7.3267, lng: 108.2211)
((SELECT id FROM auth.users LIMIT 1), 'Tim Futsal Tasik United', 'Tim futsal kompetitif di Tasikmalaya', 'advanced', '081234567890', 'Tasikmalaya', 'Jl. Sutisna Senjaya No. 123', ST_SetSRID(ST_MakePoint(108.2211, -7.3267), 4326)::geography),
((SELECT id FROM auth.users LIMIT 1), 'Tasikmalaya FC', 'Tim futsal yang suka main santai', 'intermediate', '081234567891', 'Tasikmalaya', 'Jl. RE Martadinata No. 45', ST_SetSRID(ST_MakePoint(108.2150, -7.3200), 4326)::geography),
((SELECT id FROM auth.users LIMIT 1), 'Gaspar Futsal Team', 'Tim pemula mencari lawan tanding', 'beginner', '081234567892', 'Tasikmalaya', 'Jl. Ir. H. Juanda No. 67', ST_SetSRID(ST_MakePoint(108.2280, -7.3310), 4326)::geography),
((SELECT id FROM auth.users LIMIT 1), 'Singaparna Warriors', 'Tim futsal dari Singaparna', 'intermediate', '081234567893', 'Tasikmalaya', 'Singaparna, Tasikmalaya', ST_SetSRID(ST_MakePoint(108.1100, -7.3500), 4326)::geography),

-- Ciamis teams (lat: -7.3255, lng: 108.3534)
((SELECT id FROM auth.users LIMIT 1), 'Ciamis Football Club', 'Tim futsal terbaik di Ciamis', 'advanced', '081234567894', 'Ciamis', 'Jl. Ahmad Yani No. 89', ST_SetSRID(ST_MakePoint(108.3534, -7.3255), 4326)::geography),
((SELECT id FROM auth.users LIMIT 1), 'Galunggung Strikers', 'Tim futsal menengah di Ciamis', 'intermediate', '081234567895', 'Ciamis', 'Jl. Raya Galunggung No. 34', ST_SetSRID(ST_MakePoint(108.3600, -7.3180), 4326)::geography),
((SELECT id FROM auth.users LIMIT 1), 'Ciamis Rookies', 'Tim pemula yang siap bertanding', 'beginner', '081234567896', 'Ciamis', 'Jl. Pahlawan No. 56', ST_SetSRID(ST_MakePoint(108.3450, -7.3300), 4326)::geography),
((SELECT id FROM auth.users LIMIT 1), 'Banjar FC', 'Tim futsal dari Banjar, Ciamis', 'intermediate', '081234567897', 'Ciamis', 'Banjar, Ciamis', ST_SetSRID(ST_MakePoint(108.5389, -7.3695), 4326)::geography);
