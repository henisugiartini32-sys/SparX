"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, MapPin, Send, Loader2 } from "lucide-react"
import type { Team } from "@/lib/types/team"
import { useToast } from "@/hooks/use-toast"

interface ChallengeDialogProps {
  team: Team | null
  isOpen: boolean
  onClose: () => void
}

export function ChallengeDialog({ team, isOpen, onClose }: ChallengeDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    notes: "",
  })

  if (!team) return null

  const handleSendChallenge = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/matches/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenged_team_id: team.id,
          match_date: formData.date,
          match_time: formData.time,
          location: formData.location,
          notes: formData.notes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim tantangan")
      }

      window.dispatchEvent(new CustomEvent("challengeSent"))

      toast({
        title: "Tantangan Terkirim!",
        description: "Tantangan telah disimpan di sistem. Mengarahkan ke WhatsApp...",
      })

      const message = `Halo ${team.name}, tim kami ingin menantang tim Anda bertanding futsal!

Rencana Pertandingan:
📅 Tanggal: ${formData.date}
⏰ Jam: ${formData.time}
📍 Lapangan: ${formData.location}
📝 Catatan: ${formData.notes || "-"}

Tantangan resmi telah kami kirim via aplikasi SparX. Apakah tim Anda bersedia?`

      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${team.contact_phone?.replace(/\D/g, "")}?text=${encodedMessage}`
      window.open(whatsappUrl, "_blank")
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Send className="h-5 w-5" />
            Tantang {team.name}
          </DialogTitle>
          <DialogDescription>
            Isi detail rencana pertandingan di bawah ini untuk dikirimkan melalui WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Tanggal Main
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Jam Main
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Lapangan / Area
            </Label>
            <Input
              id="location"
              placeholder="Contoh: GOR Susi Susanti, Tasikmalaya"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan detail tambahan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleSendChallenge}
            disabled={!formData.date || !formData.time || !formData.location || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Tantangan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
