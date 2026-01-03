import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("teams").select("*").eq("user_id", user.id).maybeSingle()

    if (error) {
      console.error("[v0] Error fetching user's team:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.log("[v0] No team found for user")
      return NextResponse.json({ team: null })
    }

    const enrichedTeam = data
      ? {
          ...data,
          latitude: data.location && typeof data.location === "object" ? (data.location as any).coordinates[1] : null,
          longitude: data.location && typeof data.location === "object" ? (data.location as any).coordinates[0] : null,
        }
      : null

    console.log("[v0] User team found:", data.id, data.name)
    return NextResponse.json({ team: enrichedTeam })
  } catch (error) {
    console.error("[v0] Error in my-team API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, skill_level, contact_phone, city, address, latitude, longitude, logo_url } = body // added logo_url

    if (!name || !city || !latitude || !longitude) {
      return NextResponse.json({ error: "Name, city, latitude, and longitude are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("teams")
      .update({
        name,
        description,
        skill_level,
        contact_phone,
        city,
        address,
        logo_url, // added logo_url
        location: `POINT(${longitude} ${latitude})`,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating team:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ team: data })
  } catch (error) {
    console.error("[v0] Error in update team API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
