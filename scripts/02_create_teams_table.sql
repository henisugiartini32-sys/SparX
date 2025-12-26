-- Create teams table with geospatial data
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  skill_level VARCHAR(50), -- beginner, intermediate, advanced
  contact_phone VARCHAR(20),
  city VARCHAR(100) NOT NULL,
  address TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL, -- lat/lng coordinates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index for faster geospatial queries
CREATE INDEX idx_teams_location ON teams USING GIST(location);

-- Create index on city for faster filtering
CREATE INDEX idx_teams_city ON teams(city);

-- Create index on user_id
CREATE INDEX idx_teams_user_id ON teams(user_id);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all teams
CREATE POLICY "Teams are viewable by everyone" 
ON teams FOR SELECT 
USING (true);

-- Policy: Users can insert their own teams
CREATE POLICY "Users can insert their own teams" 
ON teams FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own teams
CREATE POLICY "Users can update their own teams" 
ON teams FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own teams
CREATE POLICY "Users can delete their own teams" 
ON teams FOR DELETE 
USING (auth.uid() = user_id);
