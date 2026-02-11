"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ExamClient from "./ExamClient"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType, Quiz } from "@/app/data/types"
import { useAuth } from "@/app/lib/useAuth"
import { getUserEntitlement } from "@/app/lib/entitlement"

function isQuizType(v: string): v is QuizType {
  return (quizzes as any)[v] != null
}

export default function ExamClientWrapper() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading } = useAuth()

  const typeRaw = params.get("type")

  const [entLoaded, setEntLoaded] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<QuizType[]>([])

  // ✅ entitlement 読み込み
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }

    let alive = true
    setEntLoaded(false)

    ;(async () => {
      try {
        const ent = await getUserEntitlement(user.uid)
        if (!alive) return
        setSelectedTypes((ent.selectedQuizTypes ?? []) as QuizType[])
      } catch (e) {
        console.error("getUserEntitlement failed:", e)
        if (!alive) return
        setSelectedTypes([])
      } finally {
        if (!alive) return
        setEntLoaded(true)
      }
    })()

    return () => {
      alive = false
    }
  }, [loading, user?.uid, router, user])

  const quiz: Quiz | null = useMemo(() => {
    if (!typeRaw) return null
    if (!isQuizType(typeRaw)) return null
    return (quizzes as any)[typeRaw] as Quiz
  }, [typeRaw])

  // ✅ redirect は useEffect で（render中にしない）
  useEffect(() => {
    if (loading) return
    if (!user) return
    if (!entLoaded) return

    // 未選択なら選択画面へ
    if (selectedTypes.length === 0) {
      router.replace("/select-quizzes")
      return
    }

    // type が無い/不正なら TOPへ
    if (!typeRaw || !isQuizType(typeRaw)) {
      router.replace("/")
      return
    }

    // 選択してない教材に直リンク → 選択画面へ
    const qt = typeRaw as QuizType
    if (!selectedTypes.includes(qt)) {
      router.replace("/select-quizzes")
      return
    }
  }, [loading, user, entLoaded, selectedTypes, typeRaw, router])

  if (loading) return null
  if (!user) return null
  if (!entLoaded) return null
  if (!quiz) return null

  return <ExamClient quiz={quiz} />
}
