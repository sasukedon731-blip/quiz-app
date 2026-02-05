// app/(auth)/layout.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/useAuth"
import { ensureUserProfile } from "@/app/lib/firestore"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }

    ;(async () => {
      try {
        await ensureUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        })
      } catch (e) {
        console.error("ensureUserProfile failed:", e)
      }
    })()
  }, [user, loading, router])

  if (loading) return <p style={{ textAlign: "center" }}>読み込み中…</p>
  if (!user) return null

  return <>{children}</>
}
