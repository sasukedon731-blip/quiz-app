// app/(auth)/layout.tsx
"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/useAuth"
import { ensureUserProfile } from "@/app/lib/firestore"
import { getUserEntitlement } from "@/app/lib/entitlement"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const [entLoaded, setEntLoaded] = useState(false)
  const [selectedLen, setSelectedLen] = useState<number>(0)

  useEffect(() => {
    if (loading) return

    // 未ログインは login
    if (!user) {
      router.replace("/login")
      return
    }

    ;(async () => {
      try {
        // ✅ users/{uid} を確実に作成（初期値も入る）
        await ensureUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        })

        // ✅ 利用権チェック
        const ent = await getUserEntitlement(user.uid)
        setSelectedLen((ent.selectedQuizTypes ?? []).length)
      } catch (e) {
        console.error("AuthLayout init failed:", e)
      } finally {
        setEntLoaded(true)
      }
    })()
  }, [user, loading, router])

  // ロード中
  if (loading) return <p style={{ textAlign: "center" }}>読み込み中…</p>
  if (!user) return null

  // 利用権ロード中（ちらつき防止）
  if (!entLoaded) return <p style={{ textAlign: "center" }}>読み込み中…</p>

  // ✅ 除外ルート
  const isSelectQuizzes = pathname === "/select-quizzes"
  const isAdmin = pathname.startsWith("/admin")

  // ✅ 受講教材が未選択なら強制的に選択へ
  if (!isSelectQuizzes && !isAdmin && selectedLen === 0) {
    router.replace("/select-quizzes")
    return null
  }

  return <>{children}</>
}
