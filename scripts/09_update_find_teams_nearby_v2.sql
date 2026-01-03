-- Force update find_teams_nearby function to include logo_url and all necessary columns
-- This version ensures the return table schema matches exactly what the frontend expects
CREATE OR REPLACE FUNCTION find_teams_nearby(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 50000,
  city_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name VARCHAR(255),
  description TEXT,
  skill_level VARCHAR(50),
  contact_phone VARCHAR(20),
  city VARCHAR(100),
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  logo_url TEXT,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.user_id,
    t.name,
    t.description,
    t.skill_level,
    t.contact_phone,
    t.city,
    t.address,
    ST_Y(t.location::geometry) as latitude,
    ST_X(t.location::geometry) as longitude,
    t.logo_url,
    ST_Distance(
      t.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  FROM teams t
  WHERE 
    ST_DWithin(
      t.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
    AND (city_filter IS NULL OR t.city = city_filter)
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
