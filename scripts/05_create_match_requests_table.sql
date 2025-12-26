-- Enable RLS
ALTER TABLE IF EXISTS match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS matches ENABLE ROW LEVEL SECURITY;

-- Create match_requests table
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  challenged_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_teams CHECK (challenger_team_id != challenged_team_id)
);

-- Create matches table (for confirmed matches)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_request_id UUID NOT NULL REFERENCES match_requests(id) ON DELETE CASCADE,
  team_a_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_b_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_requests_challenger ON match_requests(challenger_team_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_challenged ON match_requests(challenged_team_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(team_a_id, team_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);

-- RLS Policies for match_requests

-- Users can view match requests where their team is involved
CREATE POLICY "Users can view their team's match requests"
  ON match_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id IN (match_requests.challenger_team_id, match_requests.challenged_team_id)
      AND teams.user_id = auth.uid()
    )
  );

-- Users can create match requests for their team
CREATE POLICY "Users can create match requests for their team"
  ON match_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = match_requests.challenger_team_id
      AND teams.user_id = auth.uid()
    )
  );

-- Users can update match requests where their team is challenged (for accept/reject)
CREATE POLICY "Challenged team can update match requests"
  ON match_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = match_requests.challenged_team_id
      AND teams.user_id = auth.uid()
    )
  );

-- Users can cancel their own match requests
CREATE POLICY "Challenger can cancel match requests"
  ON match_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = match_requests.challenger_team_id
      AND teams.user_id = auth.uid()
    )
  );

-- Users can delete their own pending match requests
CREATE POLICY "Users can delete their pending match requests"
  ON match_requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = match_requests.challenger_team_id
      AND teams.user_id = auth.uid()
    )
    AND status = 'PENDING'
  );

-- RLS Policies for matches

-- Users can view matches where their team is involved
CREATE POLICY "Users can view their team's matches"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id IN (matches.team_a_id, matches.team_b_id)
      AND teams.user_id = auth.uid()
    )
  );

-- Only system can create matches (via function/trigger)
CREATE POLICY "System can create matches"
  ON matches FOR INSERT
  WITH CHECK (true);

-- Users can update matches where their team is involved (for status changes)
CREATE POLICY "Users can update their team's matches"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id IN (matches.team_a_id, matches.team_b_id)
      AND teams.user_id = auth.uid()
    )
  );

-- Function to create match when request is accepted
CREATE OR REPLACE FUNCTION create_match_from_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ACCEPTED' AND OLD.status = 'PENDING' THEN
    INSERT INTO matches (
      match_request_id,
      team_a_id,
      team_b_id,
      match_date,
      match_time,
      location,
      notes,
      status
    ) VALUES (
      NEW.id,
      NEW.challenger_team_id,
      NEW.challenged_team_id,
      NEW.match_date,
      NEW.match_time,
      NEW.location,
      NEW.notes,
      'CONFIRMED'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS on_match_request_accepted ON match_requests;
CREATE TRIGGER on_match_request_accepted
  AFTER UPDATE ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_match_from_request();
