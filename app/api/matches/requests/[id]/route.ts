import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Update match request status (Accept/Reject/Cancel)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!["ACCEPTED", "REJECTED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const requestId = (await params).id

    // Check if the user is authorized to update this request
    const { data: requestData, error: fetchError } = await supabase
      .from("match_requests")
      .select(`
        *,
        challenger_team:teams!challenger_team_id(user_id),
        challenged_team:teams!challenged_team_id(user_id)
      `)
      .eq("id", requestId)
      .single()

    if (fetchError || !requestData) {
      return NextResponse.json({ error: "Match request not found" }, { status: 404 })
    }

    const isChallenger = (requestData.challenger_team as any).user_id === user.id
    const isChallenged = (requestData.challenged_team as any).user_id === user.id

    // Validation for status change
    if (status === "CANCELLED" && !isChallenger) {
      return NextResponse.json({ error: "Only the challenger can cancel the request" }, { status: 403 })
    }

    if (["ACCEPTED", "REJECTED"].includes(status) && !isChallenged) {
      return NextResponse.json({ error: "Only the challenged team can accept or reject" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("match_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating match request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error("[v0] Error in update match request status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
