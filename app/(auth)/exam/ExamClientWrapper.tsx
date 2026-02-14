"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ExamClient from "./ExamClient"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType, Quiz } from "@/app/data/types"
import { useAuth } from "@/app/lib/useAuth"
import { loadAndRepairUserPlanState } from "@/app/lib/userPlanState"

function isQuizType(v: string): v is QuizType {
  return (quizzes as any)[v] != null
}

export default function ExamClientWrapper() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading } = useAuth()

  const typeRaw = params.get("type")

  const [stateLoaded, setStateLoaded] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<QuizType[]>([])

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }

    let alive = true
    setStateLoaded(false)

    ;(async () => {
      try {
        const st = await loadAndRepairUserPlanState(user.uid)
        if (!alive) return
        setSelectedTypes((st.selectedQuizTypes ?? []) as QuizType[])
      } catch (e) {
        console.error("loadAndRepairUserPlanState failed:", e)
        if (!alive) return
        setSelectedTypes([])
      } finally {
        if (!alive) return
        setStateLoaded(true)
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

  useEffect(() => {
    if (loading) return
    if (!user) return
    if (!stateLoaded) return

    if (selectedTypes.length === 0) {
      router.replace("/select-quizzes")
      return
    }

    if (!typeRaw || !isQuizType(typeRaw)) {
      router.replace("/")
      return
    }

    const qt = typeRaw as QuizType
    if (!selectedTypes.includes(qt)) {
      router.replace("/select-quizzes")
      return
    }
  }, [loading, user, stateLoaded, selectedTypes, typeRaw, router])

  if (loading) return null
  if (!user) return null
  if (!stateLoaded) return null
  if (!quiz) return null

  return <ExamClient quiz={quiz} />
}
