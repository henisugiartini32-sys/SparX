"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="destructive" size="lg">
      <LogOut className="mr-2 h-5 w-5" />
      {isLoading ? "Keluar..." : "Keluar"}
    </Button>
  )
}
