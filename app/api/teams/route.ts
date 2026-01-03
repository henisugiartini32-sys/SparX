import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("teams").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching teams:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to include lat/lng from geography type
    const teams = data?.map((team: any) => ({
      ...team,
      latitude: team.location ? JSON.parse(JSON.stringify(team.location)).coordinates[1] : null,
      longitude: team.location ? JSON.parse(JSON.stringify(team.location)).coordinates[0] : null,
    }))

    return NextResponse.json({ teams: teams || [] })
  } catch (error) {
    console.error("[v0] Error in teams API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: existingTeam } = await supabase.from("teams").select("id").eq("user_id", user.id).single()

    if (existingTeam) {
      return NextResponse.json({ error: "Anda sudah memiliki tim. Silakan edit tim yang sudah ada." }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, skill_level, contact_phone, city, address, latitude, longitude, logo_url } = body

    if (!name || !city || !latitude || !longitude) {
      return NextResponse.json({ error: "Name, city, latitude, and longitude are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("teams")
      .insert([
        {
          user_id: user.id,
          name,
          description,
          skill_level,
          contact_phone,
          city,
          address,
          logo_url,
          location: `POINT(${longitude} ${latitude})`,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating team:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ team: data })
  } catch (error) {
    console.error("[v0] Error in create team API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
