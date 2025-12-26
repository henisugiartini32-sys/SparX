import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Get match requests for the user's team
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Fetching match requests for user:", user.id)

    // First get the user's team ID
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !teamData) {
      console.log("[v0] No team found for user")
      return NextResponse.json({ requests: [] })
    }

    console.log("[v0] User team ID:", teamData.id)

    const { data: requestsData, error } = await supabase
      .from("match_requests")
      .select("*")
      .or(`challenger_team_id.eq.${teamData.id},challenged_team_id.eq.${teamData.id}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching match requests:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Found requests:", requestsData?.length || 0)

    if (requestsData && requestsData.length > 0) {
      const teamIds = [
        ...new Set([
          ...requestsData.map((r) => r.challenger_team_id),
          ...requestsData.map((r) => r.challenged_team_id),
        ]),
      ]

      const { data: teamsData } = await supabase.from("teams").select("id, name, contact_phone").in("id", teamIds)

      const teamsMap = new Map(teamsData?.map((t) => [t.id, t]) || [])

      const enrichedRequests = requestsData.map((r) => ({
        ...r,
        challenger_team: teamsMap.get(r.challenger_team_id),
        challenged_team: teamsMap.get(r.challenged_team_id),
      }))

      console.log("[v0] Returning enriched requests:", enrichedRequests.length)
      return NextResponse.json({ requests: enrichedRequests })
    }

    return NextResponse.json({ requests: [] })
  } catch (error) {
    console.error("[v0] Error in match requests API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new match request
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { challenged_team_id, match_date, match_time, location, notes } = body

    if (!challenged_team_id || !match_date || !match_time || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the challenger's team ID
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !teamData) {
      return NextResponse.json({ error: "You must create a team before challenging others" }, { status: 403 })
    }

    if (teamData.id === challenged_team_id) {
      return NextResponse.json({ error: "You cannot challenge your own team" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("match_requests")
      .insert({
        challenger_team_id: teamData.id,
        challenged_team_id,
        match_date,
        match_time,
        location,
        notes,
        status: "PENDING",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating match request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error("[v0] Error in create match request API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
