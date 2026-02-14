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

  // URL param -> QuizType（不正なら null）
  const quizType = useMemo(() => parseQuizType(params.get("type")), [params])

  // Quizデータ取得（存在しなければ null）
  const quiz = useMemo(() => (quizType ? getQuizByType(quizType) : null), [quizType])

  // 今月の受講教材（selectedQuizTypes）
  const [allowed, setAllowed] = useState<QuizType[] | null>(null)
  const [stateLoaded, setStateLoaded] = useState(false)

  // ① user の plan state を読み込み（＋自動修復）
  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/login")
      return
    }

    let alive = true
    setAllowed(null)
    setStateLoaded(false)

    ;(async () => {
      try {
        const st = await loadAndRepairUserPlanState(user.uid)
        if (!alive) return
        setAllowed((st.selectedQuizTypes ?? []) as QuizType[])
      } catch (e) {
        console.error("loadAndRepairUserPlanState failed:", e)
        if (!alive) return
        setAllowed([]) // 読めなかったら安全側（選択画面へ）
      } finally {
        if (!alive) return
        setStateLoaded(true)
      }
    })()

    return () => {
      alive = false
    }
  }, [loading, user?.uid, router, user])

  // ② ガード（事故ゼロ）
  useEffect(() => {
    if (loading) return
    if (!user) return
    if (!stateLoaded) return
    if (allowed === null) return

    // (A) type が無い/不正 → hubへ
    if (!quizType) {
      router.replace("/select-mode")
      return
    }

    // (B) quizデータが無い（IDズレ等） → hubへ
    if (!quiz) {
      router.replace("/select-mode")
      return
    }

    // (C) 今月の受講教材が空 → 選択へ
    if (allowed.length === 0) {
      router.replace("/select-quizzes")
      return
    }

    // (D) 未選択教材へ直リンク → hubへ（選択済み一覧を見せる）
    if (!allowed.includes(quizType)) {
      router.replace("/select-mode")
      return
    }
  }, [loading, user, stateLoaded, allowed, quizType, quiz, router])

  // ③ 画面描画ガード
  if (loading) return null
  if (!user) return null
  if (!stateLoaded) return null
  if (allowed === null) return null
  if (!quizType) return null
  if (!quiz) return null
  if (!allowed.includes(quizType)) return null

  return <NormalClient quiz={quiz} />
}
