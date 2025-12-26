import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoutButton } from "@/components/logout-button"
import { MapPin, Users, Calendar, Trophy, Target, Search } from "lucide-react"
import Link from "next/link"
import { MapSearch } from "@/components/map-search"
import { AddTeamForm } from "@/components/add-team-form"
import { ChallengesManager } from "@/components/challenges-manager"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  return (
    <div className="min-h-svh w-full bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SparX</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 sm:flex">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs">👤</span>
              </div>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Selamat Datang di <span className="text-primary">SparX</span>
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Temukan lawan futsal di Tasikmalaya dan Ciamis dengan mudah
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <ChallengesManager />
          <MapSearch />
        </div>
      </section>

      <section className="border-t py-8 sm:py-12" id="create-team">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AddTeamForm />
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h3 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Fitur Unggulan</h3>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Semua yang Anda butuhkan untuk menemukan dan mengatur pertandingan futsal
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Pencarian Berdasarkan Wilayah</CardTitle>
                <CardDescription className="text-base">
                  Temukan tim futsal di wilayah terdekat dengan lokasi Anda
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Kelola Tim Anda</CardTitle>
                <CardDescription className="text-base">
                  Buat profil tim, undang anggota, dan atur jadwal latihan
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Atur Jadwal Pertandingan</CardTitle>
                <CardDescription className="text-base">
                  Koordinasikan waktu dan tempat pertandingan dengan mudah
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Statistik & Peringkat</CardTitle>
                <CardDescription className="text-base">
                  Lacak performa tim Anda dan lihat peringkat wilayah
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Cari Lawan Setara</CardTitle>
                <CardDescription className="text-base">
                  Temukan tim dengan level skill yang sesuai untuk pertandingan seru
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Filter Pencarian</CardTitle>
                <CardDescription className="text-base">
                  Filter berdasarkan lokasi, waktu, level skill, dan preferensi lainnya
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h3 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Siap Menemukan Lawan Tanding?</h3>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Bergabunglah dengan komunitas futsal terbesar di Tasikmalaya dan Ciamis
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base" asChild>
              <Link href="#search">
                <Search className="mr-2 h-5 w-5" />
                Mulai Cari Lawan
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-transparent" asChild>
              <Link href="#create-team">
                <Users className="mr-2 h-5 w-5" />
                Buat Tim
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; 2025 SparX. Platform pencarian lawan futsal berdasarkan wilayah.</p>
        </div>
      </footer>
    </div>
  )
}
