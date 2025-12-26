import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { latitude, longitude, radius = 100000, city } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    console.log("[v0] Search API: Searching with params:", { latitude, longitude, radius, city })

    // Call the PostGIS function to find nearby teams
    const { data, error } = await supabase.rpc("find_teams_nearby", {
      user_lat: latitude,
      user_lng: longitude,
      radius_meters: radius,
      city_filter: city || null,
    })

    if (error) {
      console.error("[v0] Error searching teams:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Search API: Found teams:", data?.length || 0)
    if (data && data.length > 0) {
      console.log("[v0] Search API: First team:", data[0])
    }

    return NextResponse.json({ teams: data || [] })
  } catch (error) {
    console.error("[v0] Error in search API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
