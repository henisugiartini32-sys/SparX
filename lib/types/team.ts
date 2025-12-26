export interface Team {
  id: string
  user_id: string
  name: string
  description: string | null
  skill_level: "beginner" | "intermediate" | "advanced" | null
  contact_phone: string | null
  city: string
  address: string | null
  latitude: number
  longitude: number
  distance_meters?: number
}

export interface TeamSearchParams {
  latitude: number
  longitude: number
  radius?: number
  city?: string
}
