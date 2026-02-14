"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ReviewClient from "./ReviewClient"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import { useAuth } from "@/app/lib/useAuth"
import { loadAndRepairUserPlanState } from "@/app/lib/userPlanState"

function isQuizType(v: string): v is QuizType {
  return (quizzes as any)[v] != null
}

export default function ReviewClientWrapper() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading } = useAuth()

  const typeRaw = params.get("type")

  const quizType = useMemo(() => {
    if (!typeRaw) return null
    if (!isQuizType(typeRaw)) return null
    return typeRaw as QuizType
  }, [typeRaw])

  const quiz = useMemo(() => {
    if (!quizType) return null
    return quizzes[quizType]
  }, [quizType])

  const [stateLoaded, setStateLoaded] = useState(false)
  const [allowed, setAllowed] = useState<QuizType[] | null>(null)

  // ① plan state 読み込み（＋自動修復）
  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/login")
      return
    }

    let alive = true
    setStateLoaded(false)
    setAllowed(null)

    ;(async () => {
      try {
        const st = await loadAndRepairUserPlanState(user.uid)
        if (!alive) return
        setAllowed((st.selectedQuizTypes ?? []) as QuizType[])
      } catch (e) {
        console.error("loadAndRepairUserPlanState failed:", e)
        if (!alive) return
        setAllowed([]) // 読めなかったら安全側
      } finally {
        if (!alive) return
        setStateLoaded(true)
      }
    })()

    return () => {
      alive = false
    }
  }, [loading, user?.uid, router, user])

  // ② ガード（Normal/Examと同じ）
  useEffect(() => {
    if (loading) return
    if (!user) return
    if (!stateLoaded) return
    if (allowed === null) return

    // (A) type が無い/不正 → hub
    if (!quizType) {
      router.replace("/select-mode")
      return
    }

    // (B) quizデータが無い（念のため） → hub
    if (!quiz) {
      router.replace("/select-mode")
      return
    }

    // (C) 今月の受講教材が空 → 選択へ
    if (allowed.length === 0) {
      router.replace("/select-quizzes")
      return
    }

    // (D) 未選択教材へ直リンク → hub
    if (!allowed.includes(quizType)) {
      router.replace("/select-mode")
      return
    }
  }, [loading, user, stateLoaded, allowed, quizType, quiz, router])

  // ③ 描画ガード
  if (loading) return null
  if (!user) return null
  if (!stateLoaded) return null
  if (allowed === null) return null
  if (!quizType) return null
  if (!quiz) return null
  if (!allowed.includes(quizType)) return null

  return <ReviewClient quiz={quiz} />
}
