"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/useAuth"
import { getUserEntitlement } from "@/app/lib/entitlement"
import { parseQuizType } from "@/app/lib/quizTypeGuard"
import { getQuizByType } from "@/app/lib/getQuizByType"
import NormalClient from "./NormalClient"

export default function NormalClientWrapper() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading } = useAuth()

  const quizType = parseQuizType(params.get("type"))
  const [allowed, setAllowed] = useState<string[] | null>(null)

  const quiz = quizType ? getQuizByType(quizType) : null

  useEffect(() => {
    if (loading || !user) return
    ;(async () => {
      const ent = await getUserEntitlement(user.uid)
      setAllowed(ent.selectedQuizTypes ?? [])
    })()
  }, [user, loading])

  // URL不正 or quiz実体なし
  if (!quizType || !quiz) {
    router.replace("/")
    return null
  }

  if (loading || allowed === null) return null

  // 利用権チェック
  if (!allowed.includes(quizType)) {
    router.replace("/select-quizzes")
    return null
  }

  // ✅ Quiz（questions入り）を渡す
  return <NormalClient quiz={quiz} />
}
