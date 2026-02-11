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

    // 未ログインは login
    if (!user) {
      router.replace("/login")
      return
    }

    // ユーザードキュメントの存在保証だけ行う
    ensureUserProfile({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    }).catch(console.error)
  }, [user, loading, router])

  if (loading) return <p style={{ textAlign: "center" }}>読み込み中…</p>
  if (!user) return null

  return <>{children}</>
}
