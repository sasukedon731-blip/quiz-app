"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ReviewClient from "./ReviewClient"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import { useAuth } from "@/app/lib/useAuth"
import { loadAndRepairUserPlanState } from "@/app/lib/userPlanState"

function isQuizType(v: string): v is QuizType {
  return v in quizzes
}

export default function ReviewClientWrapper() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading } = useAuth()

  const typeRaw = params.get("type")
  const quizType = useMemo(() => (typeRaw && isQuizType(typeRaw) ? (typeRaw as QuizType) : null), [typeRaw])

  const [stateLoaded, setStateLoaded] = useState(false)
  const [allowed, setAllowed] = useState<QuizType[] | null>(null)

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
        setAllowed([])
      } finally {
        if (!alive) return
        setStateLoaded(true)
      }
    })()

    return () => {
      alive = false
    }
  }, [loading, user?.uid, router, user])

  useEffect(() => {
    if (loading) return
    if (!user) return
    if (!stateLoaded) return

    if (!quizType) {
      router.replace("/")
      return
    }

    if ((allowed ?? []).length === 0) {
      router.replace("/select-quizzes")
      return
    }

    if (!(allowed ?? []).includes(quizType)) {
      router.replace("/select-quizzes")
      return
    }
  }, [loading, user, stateLoaded, allowed, quizType, router])

  if (loading) return null
  if (!user) return null
  if (!stateLoaded) return null
  if (!quizType) return null
  if (allowed === null) return null
  if (!allowed.includes(quizType)) return null

  const quiz = quizzes[quizType]
  return <ReviewClient quiz={quiz} />
}
