-- adding logo_url column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- creating storage bucket for team logos
-- Note: This is usually done via Supabase client/dashboard, but we can try to provide a SQL-based bucket creation if the platform supports it
-- However, we'll focus on the schema first.
