export type MatchStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED"
export type ConfirmedMatchStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED"

export interface MatchRequest {
  id: string
  challenger_team_id: string
  challenged_team_id: string
  match_date: string
  match_time: string
  location: string
  notes: string | null
  status: MatchStatus
  created_at: string
  updated_at: string
  challenger_team?: {
    name: string
    contact_phone: string
  }
  challenged_team?: {
    name: string
    contact_phone: string
  }
}

export interface ConfirmedMatch {
  id: string
  match_request_id: string
  team_a_id: string
  team_b_id: string
  match_date: string
  match_time: string
  location: string
  notes: string | null
  status: ConfirmedMatchStatus
  created_at: string
  updated_at: string
  team_a?: {
    name: string
    contact_phone: string
  }
  team_b?: {
    name: string
    contact_phone: string
  }
}
