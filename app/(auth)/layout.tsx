// app/(auth)/layout.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/useAuth"
import { ensureUserProfile } from "@/app/lib/firestore"
import { loadAndRepairUserPlanState } from "@/app/lib/userPlanState"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const [entLoaded, setEntLoaded] = useState(false)
  const [selectedLen, setSelectedLen] = useState(0)

  const isSelectQuizzes = pathname === "/select-quizzes"
  const isAdmin = pathname.startsWith("/admin")

  // ✅ 重要：ルートが変わるたびに entitlement を読み直す（保存直後の反映が遅れない）
  useEffect(() => {
    if (loading) return

    // 未ログインは login
    if (!user) {
      router.replace("/login")
      return
    }

    let alive = true
    setEntLoaded(false)

    ;(async () => {
      try {
        // users/{uid} を確実に作成
        await ensureUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        })

        // entitlement 読み込み
        const state = await loadAndRepairUserPlanState(user.uid)
        if (!alive) return
        setSelectedLen((state.selectedQuizTypes ?? []).length)
      } catch (e) {
        console.error("AuthLayout init failed:", e)
      } finally {
        if (!alive) return
        setEntLoaded(true)
      }
    })()

    return () => {
      alive = false
    }
  }, [user?.uid, loading, pathname, router])

  // ✅ 重要：redirect は render 中にしない（ループ防止）
  useEffect(() => {
    if (loading) return
    if (!user) return
    if (!entLoaded) return

    // 受講教材が未選択なら強制的に選択へ（select-quizzes / admin は除外）
    if (!isSelectQuizzes && !isAdmin && selectedLen === 0) {
      router.replace("/select-quizzes")
    }
  }, [loading, user, entLoaded, selectedLen, isSelectQuizzes, isAdmin, router])

  // ロード中表示
  if (loading) return <p style={{ textAlign: "center" }}>読み込み中…</p>
  if (!user) return null

  // entitlement ロード中（ちらつき防止）
  if (!entLoaded) return <p style={{ textAlign: "center" }}>読み込み中…</p>

  // select-quizzes / admin はそのまま見せる
  if (isSelectQuizzes || isAdmin) {
    return <>{children}</>
  }

  // 未選択の場合は useEffect で飛ばすのでここは一旦 null（チラつきなし）
  if (selectedLen === 0) return null

  return <>{children}</>
}
