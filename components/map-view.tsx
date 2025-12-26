"use client"

import dynamic from "next/dynamic"
import type { Team } from "@/lib/types/team"

interface MapViewProps {
  center: [number, number]
  teams: Team[]
  userLocation: [number, number] | null
  onChallenge?: (team: Team) => void // tambahkan prop onChallenge
}

const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-lg border bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center">
        <div className="mb-2 text-4xl">🗺️</div>
        <p className="text-sm text-gray-600">Memuat peta...</p>
      </div>
    </div>
  ),
})

export default function MapView({ center, teams, userLocation, onChallenge }: MapViewProps) {
  return <MapComponent center={center} teams={teams} userLocation={userLocation} onChallenge={onChallenge} />
}
