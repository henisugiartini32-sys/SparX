"use client"

import { useEffect, useRef, useState } from "react"

interface MapPickerProps {
  center: [number, number]
  onLocationSelect: (lat: number, lng: number) => void
}

export default function MapPicker({ center, onLocationSelect }: MapPickerProps) {
  const [L, setL] = useState<any>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      console.log("[v0] MapPicker: Leaflet loaded successfully")
      setL(leaflet.default)
    })
  }, [])

  useEffect(() => {
    if (!L || !containerRef.current || initializedRef.current) return

    console.log("[v0] MapPicker: Initializing map with center:", center)

    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })

    const mapInstance = L.map(containerRef.current).setView(center, 13)
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

    mapInstance.on("click", (e: any) => {
      const { lat, lng } = e.latlng
      console.log("[v0] MapPicker: Location selected:", lat, lng)
      setSelectedPosition([lat, lng])
      onLocationSelect(lat, lng)

      if (markerRef.current) {
        markerRef.current.remove()
      }

      const newMarker = L.marker([lat, lng]).addTo(mapInstance)
      newMarker.bindPopup("Lokasi Tim Anda").openPopup()
      markerRef.current = newMarker
    })

    console.log("[v0] MapPicker: Map initialized successfully")
    initializedRef.current = true

    return () => {
      console.log("[v0] MapPicker: Cleaning up map instance")
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      initializedRef.current = false
    }
  }, [L])

  return (
    <div className="relative">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div ref={containerRef} className="h-[300px] w-full rounded-lg border shadow-sm" />

      <div className="mt-2 text-center text-sm text-muted-foreground">
        {selectedPosition ? (
          <span className="text-green-600">
            ✓ Lokasi dipilih: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
          </span>
        ) : (
          "Klik pada peta untuk memilih lokasi tim Anda"
        )}
      </div>
    </div>
  )
}
