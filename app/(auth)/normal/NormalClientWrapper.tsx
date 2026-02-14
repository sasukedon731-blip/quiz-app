"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/useAuth"
import { loadAndRepairUserPlanState } from "@/app/lib/userPlanState"
import { parseQuizType } from "@/app/lib/quizTypeGuard"
import { getQuizByType } from "@/app/lib/getQuizByType"
import NormalClient from "./NormalClient"
import type { QuizType } from "@/app/data/types"

export default function NormalClientWrapper() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading } = useAuth()

  // ✅ typeは遷移直後に null になることがあるので、いったん受けて memo
  const quizType = useMemo(() => parseQuizType(params.get("type")), [params])
  const quiz = useMemo(() => (quizType ? getQuizByType(quizType) : null), [quizType])

  const [allowed, setAllowed] = useState<string[] | null>(null)
  const [entLoaded, setEntLoaded] = useState(false)

  // ✅ entitlement 読み込み
  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/login")
      return
    }

    let alive = true
    setAllowed(null)
    setEntLoaded(false)

    ;(async () => {
      try {
        const state = await loadAndRepairUserPlanState(user.uid)
        if (!alive) return
        setAllowed(state.selectedQuizTypes ?? [])
      } catch (e) {
        console.error("getUserEntitlement failed:", e)
        if (!alive) return
        setAllowed([])
      } finally {
        if (!alive) return
        setEntLoaded(true)
      }
    })()

    return () => {
      alive = false
    }
  }, [loading, user?.uid, router, user])

  // ✅ redirect は useEffect で（render中にやらない）
  useEffect(() => {
    if (loading) return
    if (!user) return
    if (!entLoaded) return

    // URL不正 or quiz実体なし → TOPへ
    if (!quizType || !quiz) {
      router.replace("/")
      return
    }

    // 未選択 → 選択画面へ
    if ((allowed ?? []).length === 0) {
      router.replace("/select-quizzes")
      return
    }

    // 利用権チェック（選んでない教材に直リンクしてたら選択画面へ）
    if (!(allowed ?? []).includes(quizType)) {
      router.replace("/select-quizzes")
      return
    }
  }, [loading, user, entLoaded, allowed, quizType, quiz, router])

  // 表示：ロード完了まで待つ（ちらつき防止）
  if (loading) return null
  if (!user) return null
  if (!entLoaded) return null
  if (!quizType || !quiz) return null
  if (allowed === null) return null
  if (!allowed.includes(quizType)) return null

  // ✅ Quiz（questions入り）を渡す
  return <NormalClient quiz={quiz} />
}
