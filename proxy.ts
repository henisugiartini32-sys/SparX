import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // <CHANGE> Improved auth check with proper error handling for invalid tokens
  let user = null
  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()

    // If there's an auth error (like invalid refresh token), clear all auth cookies
    if (error) {
      console.log("[v0] Auth error in middleware:", error.message)
      // Clear all Supabase auth cookies
      const authCookies = request.cookies
        .getAll()
        .filter((cookie) => cookie.name.startsWith("sb-"))
        .map((cookie) => cookie.name)

      authCookies.forEach((cookieName) => {
        supabaseResponse.cookies.delete(cookieName)
      })
    } else {
      user = authUser
    }
  } catch (error) {
    console.log("[v0] Exception in middleware auth check:", error)
    // Clear cookies on exception too
    const authCookies = request.cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-"))
      .map((cookie) => cookie.name)

    authCookies.forEach((cookieName) => {
      supabaseResponse.cookies.delete(cookieName)
    })
  }

  // Redirect unauthenticated users trying to access dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if ((request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")) && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
