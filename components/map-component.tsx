"use client"

import { useEffect, useRef, useState } from "react"
import type { Team } from "@/lib/types/team"
import { Sword } from "lucide-react" // added sword icon for challenge action
import { Button } from "@/components/ui/button" // added button component

interface MapComponentProps {
  center: [number, number]
  teams: Team[]
  userLocation: [number, number] | null
  onChallenge?: (team: Team) => void // tambahkan prop onChallenge
}

export default function MapComponent({ center, teams, userLocation, onChallenge }: MapComponentProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [L, setL] = useState<any>(null)
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      console.log("[v0] Leaflet loaded successfully")
      setL(leaflet.default)
    })
  }, [])

  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return

    console.log("[v0] Initializing map with center:", center)

    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })

    const mapInstance = L.map(containerRef.current).setView(center, 11)
    mapRef.current = mapInstance

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance)

    const bounds = L.latLngBounds([
      [-7.6, 107.9],
      [-7.0, 108.7],
    ])
    mapInstance.setMaxBounds(bounds)
    mapInstance.fitBounds(bounds)

    console.log("[v0] Map initialized successfully")

    return () => {
      console.log("[v0] Cleaning up map instance")
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [L, center])

  useEffect(() => {
    if (!mapRef.current || !L || teams.length === 0) return

    console.log("[v0] Adding markers for", teams.length, "teams")

    const markers: any[] = []
    const map = mapRef.current

    if (userLocation) {
      const userMarker = L.marker(userLocation, {
        icon: L.divIcon({
          className: "custom-user-marker",
          html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(map)

      userMarker.bindPopup("<b>Lokasi Anda</b>")
      markers.push(userMarker)
    }

    teams.forEach((team) => {
      console.log(`[v0] Rendering marker for ${team.name}, ID: ${team.id}, logo_url: ${team.logo_url || "NULL"}`)

      const color =
        team.skill_level === "advanced" ? "#ef4444" : team.skill_level === "intermediate" ? "#f59e0b" : "#10b981"

      const markerHtml = team.logo_url
        ? `<div style="background: white; width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${color}; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; overflow: hidden; animation: bounce 0.5s ease-out;">
             <img src="${team.logo_url}" alt="${team.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='⚽';" />
           </div>`
        : `<div style="background: ${color}; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px; animation: bounce 0.5s ease-out;">⚽</div>`

      const teamMarker = L.marker([team.latitude, team.longitude], {
        icon: L.divIcon({
          className: "custom-team-marker",
          html: markerHtml,
          iconSize: team.logo_url ? [44, 44] : [34, 34],
          iconAnchor: team.logo_url ? [22, 22] : [17, 17],
        }),
      }).addTo(map)

      const skillLevelText =
        team.skill_level === "advanced" ? "Mahir" : team.skill_level === "intermediate" ? "Menengah" : "Pemula"

      const distanceText = team.distance_meters
        ? `<br><small>${(team.distance_meters / 1000).toFixed(2)} km dari Anda</small>`
        : ""

      const contactText = team.contact_phone ? `<br><small>📞 ${team.contact_phone}</small>` : ""

      teamMarker.bindPopup(
        `<div style="min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            ${team.logo_url ? `<img src="${team.logo_url}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;" />` : ""}
            <b style="font-size: 14px;">${team.name}</b>
          </div>
          <p style="margin: 0 0 8px 0; font-size: 13px;">${team.description || ""}</p>
          <small>Level: ${skillLevelText}</small>
          ${distanceText}
          ${contactText}
        </div>`,
      )

      teamMarker.on("click", () => {
        setSelectedTeam(team)
      })

      markers.push(teamMarker)
    })

    console.log("[v0] Added", markers.length, "markers to map")

    return () => {
      console.log("[v0] Cleaning up markers")
      markers.forEach((marker) => {
        if (map && marker) {
          marker.remove()
        }
      })
    }
  }, [L, teams, userLocation])

  return (
    <div className="relative">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div ref={containerRef} className="h-[500px] w-full rounded-lg border shadow-lg" />

      {selectedTeam && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] rounded-lg border bg-white p-4 shadow-xl">
          <button
            onClick={() => setSelectedTeam(null)}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{selectedTeam.name}</h3>
              {selectedTeam.description && <p className="mt-1 text-sm text-gray-600">{selectedTeam.description}</p>}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-3 py-1">
                  Level:{" "}
                  {selectedTeam.skill_level === "advanced"
                    ? "Mahir"
                    : selectedTeam.skill_level === "intermediate"
                      ? "Menengah"
                      : "Pemula"}
                </span>
                {selectedTeam.distance_meters && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                    📍 {(selectedTeam.distance_meters / 1000).toFixed(2)} km
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              {selectedTeam.contact_phone ? (
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 sm:w-auto"
                  onClick={() => {
                    if (onChallenge) {
                      onChallenge(selectedTeam)
                    } else {
                      const message = `Halo ${selectedTeam.name}, kami melihat tim Anda di SparX dan ingin menantang bertanding futsal. Apakah tersedia?`
                      const encodedMessage = encodeURIComponent(message)
                      window.open(
                        `https://wa.me/${selectedTeam.contact_phone.replace(/\D/g, "")}?text=${encodedMessage}`,
                        "_blank",
                      )
                    }
                  }}
                >
                  <Sword className="mr-2 h-4 w-4" />
                  Tantang Tim
                </Button>
              ) : (
                <Button disabled className="w-full sm:w-auto">
                  <Sword className="mr-2 h-4 w-4" />
                  Kontak Tidak Tersedia
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
