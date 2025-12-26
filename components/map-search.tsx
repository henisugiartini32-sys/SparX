"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Phone, Users, Loader2, Sword } from "lucide-react"
import type { Team } from "@/lib/types/team"
import dynamic from "next/dynamic"
import { ChallengeDialog } from "@/components/challenge-dialog"

const MapComponent = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-lg bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

export function MapSearch() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [radius, setRadius] = useState<number>(100000)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [challengeTeam, setChallengeTeam] = useState<Team | null>(null)

  const defaultCenter: [number, number] = [-7.3261, 108.2872]

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(location)
          handleSearch(location)
        },
        () => {
          setUserLocation(defaultCenter)
          handleSearch(defaultCenter)
        },
      )
    } else {
      setUserLocation(defaultCenter)
      handleSearch(defaultCenter)
    }
  }, [refreshTrigger])

  useEffect(() => {
    const handleTeamAdded = () => {
      console.log("[v0] MapSearch: teamAdded event received, refreshing data")
      setRefreshTrigger((prev) => prev + 1)
    }

    window.addEventListener("teamAdded", handleTeamAdded)
    return () => window.removeEventListener("teamAdded", handleTeamAdded)
  }, [])

  const handleSearch = async (location?: [number, number]) => {
    setLoading(true)
    const searchLocation = location || userLocation || defaultCenter

    console.log("[v0] MapSearch: Searching teams at location:", searchLocation, "radius:", radius)

    try {
      const response = await fetch("/api/teams/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: searchLocation[0],
          longitude: searchLocation[1],
          radius,
          city: selectedCity === "all" ? null : selectedCity,
        }),
      })

      const data = await response.json()
      console.log("[v0] MapSearch: Found", data.teams?.length || 0, "teams")
      if (data.teams && data.teams.length > 0) {
        console.log("[v0] MapSearch: First team details:", data.teams[0])
      }
      setTeams(data.teams || [])
    } catch (error) {
      console.error("[v0] MapSearch: Error searching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchClick = () => {
    handleSearch()
  }

  return (
    <div className="space-y-6" id="search">
      <ChallengeDialog team={challengeTeam} isOpen={!!challengeTeam} onClose={() => setChallengeTeam(null)} />

      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Pencarian Lawan Futsal</CardTitle>
          <CardDescription className="text-base">
            Temukan lawan futsal di Tasikmalaya dan Ciamis berdasarkan lokasi Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  Kota
                </Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Pilih kota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kota</SelectItem>
                    <SelectItem value="Tasikmalaya">Tasikmalaya</SelectItem>
                    <SelectItem value="Ciamis">Ciamis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="radius" className="text-sm font-medium">
                  Radius (km)
                </Label>
                <Input
                  id="radius"
                  type="number"
                  min="1"
                  max="200"
                  value={radius / 1000}
                  onChange={(e) => setRadius(Number(e.target.value) * 1000)}
                />
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <Button onClick={handleSearchClick} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mencari...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Cari Lawan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Peta Lokasi</CardTitle>
            <CardDescription>
              {teams.length > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{teams.length}</span> tim ditemukan dalam radius{" "}
                  <span className="font-semibold text-foreground">{radius / 1000} km</span>
                </>
              ) : (
                "Belum ada tim ditemukan"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MapComponent
              center={userLocation || defaultCenter}
              teams={teams}
              userLocation={userLocation}
              onChallenge={(team) => setChallengeTeam(team)}
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg lg:col-span-1">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Daftar Tim</CardTitle>
            <CardDescription>Tim futsal yang ditemukan di sekitar Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
              {teams.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Tidak ada tim ditemukan</p>
                  <p className="mt-1 text-sm text-muted-foreground">Coba ubah filter pencarian Anda</p>
                </div>
              )}
              {teams.map((team) => (
                <Card key={team.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-balance font-semibold leading-tight">{team.name}</h3>
                          {team.description && (
                            <p className="mt-1 text-pretty text-sm text-muted-foreground">{team.description}</p>
                          )}
                        </div>
                        {team.skill_level && (
                          <Badge
                            variant={
                              team.skill_level === "advanced"
                                ? "default"
                                : team.skill_level === "intermediate"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="shrink-0"
                          >
                            {team.skill_level === "advanced"
                              ? "Mahir"
                              : team.skill_level === "intermediate"
                                ? "Menengah"
                                : "Pemula"}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {team.city} - {team.address}
                          </span>
                        </div>
                        {team.distance_meters && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 shrink-0" />
                            <span className="font-medium text-foreground">
                              {(team.distance_meters / 1000).toFixed(2)} km
                            </span>
                            <span>dari lokasi Anda</span>
                          </div>
                        )}
                        {team.contact_phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4 shrink-0" />
                            <a href={`tel:${team.contact_phone}`} className="hover:text-primary hover:underline">
                              {team.contact_phone}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-1">
                        {team.contact_phone ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 bg-transparent"
                            onClick={() => {
                              setChallengeTeam(team)
                            }}
                          >
                            <Sword className="mr-2 h-3 w-3" />
                            Tantang
                          </Button>
                        ) : (
                          <Button disabled variant="outline" size="sm" className="w-full bg-transparent">
                            Tantang (No Kontak)
                          </Button>
                        )}
                        {team.contact_phone && (
                          <Button variant="ghost" size="sm" asChild className="px-2">
                            <a href={`tel:${team.contact_phone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
