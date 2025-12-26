"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Check, X, MessageSquare, Loader2 } from "lucide-react"
import type { MatchRequest } from "@/lib/types/match"
import { useToast } from "@/hooks/use-toast"

export function ChallengesManager() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<MatchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [userTeamId, setUserTeamId] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      console.log("[v0] ChallengesManager: Fetching team and requests...")

      // First get my team info
      const teamRes = await fetch("/api/teams/my-team")
      const teamData = await teamRes.json()

      console.log("[v0] ChallengesManager: Team data:", teamData)

      if (teamData.team) {
        setUserTeamId(teamData.team.id)
        console.log("[v0] ChallengesManager: User team ID:", teamData.team.id)
      }

      const res = await fetch("/api/matches/requests")
      const data = await res.json()

      console.log("[v0] ChallengesManager: Requests response:", data)

      if (res.ok) {
        setRequests(data.requests || [])
        console.log("[v0] ChallengesManager: Set requests count:", data.requests?.length || 0)
      }
    } catch (error) {
      console.error("[v0] ChallengesManager: Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()

    const handleChallengeSent = () => {
      console.log("[v0] ChallengesManager: Received challengeSent event, refreshing...")
      fetchRequests()
    }

    window.addEventListener("challengeSent", handleChallengeSent)
    return () => window.removeEventListener("challengeSent", handleChallengeSent)
  }, [])

  const handleStatusUpdate = async (
    id: string,
    status: "ACCEPTED" | "REJECTED" | "CANCELLED",
    opponentName: string,
    opponentPhone: string,
  ) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/matches/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error("Gagal memperbarui status")

      toast({
        title: status === "ACCEPTED" ? "Tantangan Diterima!" : "Tantangan Ditolak",
        description:
          status === "ACCEPTED"
            ? `Membuka WhatsApp untuk koordinasi dengan ${opponentName}...`
            : "Status tantangan telah diperbarui.",
      })

      if (status === "ACCEPTED" && opponentPhone) {
        const message = `Halo ${opponentName}, kami menerima tantangan pertandingan futsal Anda! Ayo koordinasikan lebih lanjut.`
        window.open(`https://wa.me/${opponentPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank")
      }

      fetchRequests()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const incoming = requests.filter((r) => r.challenged_team_id === userTeamId)
  const outgoing = requests.filter((r) => r.challenger_team_id === userTeamId)

  console.log("[v0] ChallengesManager: Incoming count:", incoming.length, "Outgoing count:", outgoing.length)

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border bg-muted/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const RequestCard = ({ request, type }: { request: MatchRequest; type: "incoming" | "outgoing" }) => {
    const isPending = request.status === "PENDING"
    const opponent = type === "incoming" ? request.challenger_team : request.challenged_team

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{opponent?.name}</span>
                <Badge
                  variant={
                    request.status === "ACCEPTED"
                      ? "default"
                      : request.status === "REJECTED"
                        ? "destructive"
                        : request.status === "CANCELLED"
                          ? "secondary"
                          : "outline"
                  }
                >
                  {request.status}
                </Badge>
              </div>
              <div className="grid gap-x-4 gap-y-1 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {request.match_date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {request.match_time}
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="h-4 w-4" />
                  {request.location}
                </div>
              </div>
              {request.notes && <p className="text-sm italic text-muted-foreground mt-1">"{request.notes}"</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              {type === "incoming" && isPending && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      handleStatusUpdate(request.id, "ACCEPTED", opponent?.name || "", opponent?.contact_phone || "")
                    }
                    disabled={!!processingId}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Terima
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(request.id, "REJECTED", opponent?.name || "", "")}
                    disabled={!!processingId}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Tolak
                  </Button>
                </>
              )}
              {type === "outgoing" && isPending && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate(request.id, "CANCELLED", "", "")}
                  disabled={!!processingId}
                >
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>
              )}
              {request.status === "ACCEPTED" && opponent?.contact_phone && (
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`https://wa.me/${opponent.contact_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat WA
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight">Manajemen Tantangan</h3>
        <Button variant="ghost" size="sm" onClick={fetchRequests} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="incoming" className="relative">
            Tantangan Masuk
            {incoming.filter((r) => r.status === "PENDING").length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {incoming.filter((r) => r.status === "PENDING").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">Tantangan Saya</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming" className="mt-4">
          {incoming.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border rounded-lg bg-muted/5">
              Belum ada tantangan masuk.
            </div>
          ) : (
            incoming.map((r) => <RequestCard key={r.id} request={r} type="incoming" />)
          )}
        </TabsContent>
        <TabsContent value="outgoing" className="mt-4">
          {outgoing.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border rounded-lg bg-muted/5">
              Anda belum mengirim tantangan apa pun.
            </div>
          ) : (
            outgoing.map((r) => <RequestCard key={r.id} request={r} type="outgoing" />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
