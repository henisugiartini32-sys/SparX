import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Selamat Datang di SparX</h1>
          <p className="text-lg text-muted-foreground">Platform pencarian lawan futsal berdasarkan wilayah</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mulai Sekarang</CardTitle>
            <CardDescription>Masuk atau daftar untuk mengakses aplikasi</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button asChild className="flex-1" size="lg">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent" size="lg">
              <Link href="/register">Daftar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
