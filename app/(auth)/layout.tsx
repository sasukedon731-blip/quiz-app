"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../lib/useAuth"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      // ✅ 未ログインは必ず login
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>読み込み中…</p>
  }

  if (!user) return null

  return <>{children}</>
}
