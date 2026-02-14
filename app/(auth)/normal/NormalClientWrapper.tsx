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

  const quizType = useMemo(() => parseQuizType(params.get("type")), [params])
  const quiz = useMemo(() => (quizType ? getQuizByType(quizType) : null), [quizType])

  const [allowed, setAllowed] = useState<QuizType[] | null>(null)
  const [stateLoaded, setStateLoaded] = useState(false)

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

    if (!quizType || !quiz) {
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
  }, [loading, user, stateLoaded, allowed, quizType, quiz, router])

  if (loading) return null
  if (!user) return null
  if (!stateLoaded) return null
  if (!quizType || !quiz) return null
  if (allowed === null) return null
  if (!allowed.includes(quizType)) return null

  return <NormalClient quiz={quiz} />
}
