"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MapPin, Plus, Save } from "lucide-react"
import { regions, type Kabupaten } from "@/lib/data/regions"
import dynamic from "next/dynamic"

const MapPicker = dynamic(() => import("@/components/map-picker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface AddTeamFormProps {
  onSuccess?: () => void
}

export function AddTeamForm({ onSuccess }: AddTeamFormProps) {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    skill_level: "",
    contact_phone: "",
    kabupaten: "",
    kecamatan: "",
    desa: "",
    latitude: -7.3261,
    longitude: 108.2872,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const loadUserTeam = async () => {
      try {
        const response = await fetch("/api/teams/my-team")
        const data = await response.json()

        if (data.team) {
          setIsEditMode(true)
          setTeamId(data.team.id)

          // Parse address back into components
          const addressParts = data.team.address ? data.team.address.split(", ") : []
          const desa = addressParts[0] || ""
          const kecamatan = addressParts[1] || ""
          const kabupaten = addressParts[2] || data.team.city || ""

          setFormData({
            name: data.team.name || "",
            description: data.team.description || "",
            skill_level: data.team.skill_level || "",
            contact_phone: data.team.contact_phone || "",
            kabupaten: kabupaten,
            kecamatan: kecamatan,
            desa: desa,
            latitude: data.team.latitude || -7.3261,
            longitude: data.team.longitude || 108.2872,
          })
        }
      } catch (err) {
        console.error("[v0] Error loading user team:", err)
      } finally {
        setInitialLoading(false)
      }
    }

    loadUserTeam()
  }, [])

  const handleKabupatenChange = (value: string) => {
    setFormData({
      ...formData,
      kabupaten: value,
      kecamatan: "",
      desa: "",
    })
  }

  const handleKecamatanChange = (value: string) => {
    setFormData({
      ...formData,
      kecamatan: value,
      desa: "",
    })
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    console.log("[v0] AddTeamForm: Submitting form data:", formData)

    if (!formData.name || !formData.kabupaten || !formData.kecamatan || !formData.desa) {
      setError("Nama tim, kabupaten, kecamatan, dan desa wajib diisi")
      setLoading(false)
      return
    }

    try {
      const address = `${formData.desa}, ${formData.kecamatan}, ${formData.kabupaten}`

      const url = isEditMode ? "/api/teams/my-team" : "/api/teams"
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          skill_level: formData.skill_level || null,
          contact_phone: formData.contact_phone,
          city: formData.kabupaten,
          address: address,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} tim`)
      }

      console.log(`[v0] AddTeamForm: Team ${isEditMode ? "updated" : "added"} successfully:`, data)
      setSuccess(`Tim berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}!`)

      if (!isEditMode) {
        setIsEditMode(true)
        setTeamId(data.team.id)
      }

      console.log("[v0] AddTeamForm: Dispatching teamAdded event")
      window.dispatchEvent(new Event("teamAdded"))

      setTimeout(() => {
        document.getElementById("search")?.scrollIntoView({ behavior: "smooth" })
      }, 1000)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("[v0] AddTeamForm: Error submitting form:", err)
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const kecamatanOptions = formData.kabupaten ? Object.keys(regions[formData.kabupaten as Kabupaten].kecamatan) : []

  const desaOptions =
    formData.kabupaten && formData.kecamatan
      ? regions[formData.kabupaten as Kabupaten].kecamatan[
          formData.kecamatan as keyof (typeof regions)[Kabupaten]["kecamatan"]
        ].desa
      : []

  if (initialLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{isEditMode ? "Edit Tim Anda" : "Tambahkan Tim Anda"}</CardTitle>
        <CardDescription className="text-base">
          {isEditMode
            ? "Perbarui informasi tim futsal Anda"
            : "Daftarkan tim futsal Anda untuk ditemukan oleh lawan-lawan baru"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nama Tim <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Garuda FC"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Deskripsi Tim
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ceritakan tentang tim Anda..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="skill_level" className="text-sm font-medium">
                  Level Kemampuan
                </Label>
                <Select
                  value={formData.skill_level}
                  onValueChange={(value) => setFormData({ ...formData, skill_level: value })}
                >
                  <SelectTrigger id="skill_level">
                    <SelectValue placeholder="Pilih level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Pemula</SelectItem>
                    <SelectItem value="intermediate">Menengah</SelectItem>
                    <SelectItem value="advanced">Mahir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-sm font-medium">
                  Nomor Kontak
                </Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="08123456789"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Alamat Tim</h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="kabupaten" className="text-sm font-medium">
                    Kabupaten <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.kabupaten} onValueChange={handleKabupatenChange}>
                    <SelectTrigger id="kabupaten">
                      <SelectValue placeholder="Pilih kabupaten" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(regions).map((kab) => (
                        <SelectItem key={kab} value={kab}>
                          {kab}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kecamatan" className="text-sm font-medium">
                    Kecamatan <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.kecamatan}
                    onValueChange={handleKecamatanChange}
                    disabled={!formData.kabupaten}
                  >
                    <SelectTrigger id="kecamatan">
                      <SelectValue placeholder="Pilih kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {kecamatanOptions.map((kec) => (
                        <SelectItem key={kec} value={kec}>
                          {kec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desa" className="text-sm font-medium">
                    Desa <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.desa}
                    onValueChange={(value) => setFormData({ ...formData, desa: value })}
                    disabled={!formData.kecamatan}
                  >
                    <SelectTrigger id="desa">
                      <SelectValue placeholder="Pilih desa" />
                    </SelectTrigger>
                    <SelectContent>
                      {desaOptions.map((desa) => (
                        <SelectItem key={desa} value={desa}>
                          {desa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                <MapPin className="mr-1 inline-block h-4 w-4" />
                Pilih Lokasi di Peta <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">Klik pada peta untuk menentukan lokasi tim Anda</p>
              <MapPicker center={[formData.latitude, formData.longitude]} onLocationSelect={handleLocationSelect} />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Latitude: {formData.latitude.toFixed(6)}</div>
                <div>Longitude: {formData.longitude.toFixed(6)}</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Memperbarui..." : "Menambahkan..."}
              </>
            ) : (
              <>
                {isEditMode ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Perbarui Tim
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambahkan Tim
                  </>
                )}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
