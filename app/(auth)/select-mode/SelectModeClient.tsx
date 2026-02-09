// app/(auth)/select-mode/SelectModeClient.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import QuizLayout from "@/app/components/QuizLayout"
import Button from "@/app/components/Button"
import { quizCatalog, type QuizMode } from "@/app/data/quizCatalog"
import { useAuth } from "@/app/lib/useAuth"
import { getUserEntitlement, canAccessQuiz } from "@/app/lib/entitlement"

const MODE_LABEL: Record<QuizMode, string> = {
  normal: "標準問題（練習）",
  exam: "模擬試験（本番形式）",
  review: "復習（間違えた問題）",
}

export default function SelectModeClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()

  const typeRaw = searchParams.get("type") // string | null

  const quizDef = useMemo(() => {
    if (!typeRaw) return null
    return quizCatalog.find((q) => q.id === typeRaw && q.enabled) ?? null
  }, [typeRaw])

  const [allowed, setAllowed] = useState<string[] | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) return
    ;(async () => {
      const ent = await getUserEntitlement(user.uid)
      setAllowed(ent.selectedQuizTypes ?? [])
    })()
  }, [user, loading])

  // type が無い → HOME
  if (!typeRaw) {
    router.replace("/")
    return null
  }

  // catalogに存在しない or 無効 → HOME
  if (!quizDef) {
    router.replace("/")
    return null
  }

  // 利用権ロード待ち
  if (loading || allowed === null) return null
  if (!user) return null

  // 未選択なら選択へ（layoutでも弾いてるが二重でも安全）
  if (allowed.length === 0) {
    router.replace("/select-quizzes")
    return null
  }

  // 今の教材が許可されてないなら選択へ
  if (!canAccessQuiz(allowed, quizDef.id)) {
    router.replace("/select-quizzes")
    return null
  }

  return (
    <QuizLayout title="モード選択">
      {/* ✅ 今選んでいる教材を明示 */}
      <div
        className="mb-4 inline-block rounded-lg px-4 py-2 text-lg font-extrabold"
        style={{ background: "#eff6ff", color: "#1d4ed8" }}
      >
        {quizDef.title}
      </div>

      <p className="mb-4 text-sm text-gray-600">
        「{quizDef.title}」の学習モードを選択してください
      </p>

      <div className="space-y-3">
        {quizDef.modes.includes("normal") && (
          <Button
            variant="main"
            onClick={() => router.push(`/normal?type=${encodeURIComponent(quizDef.id)}`)}
          >
            {MODE_LABEL.normal}
          </Button>
        )}

        {quizDef.modes.includes("exam") && (
          <Button
            variant="main"
            onClick={() => router.push(`/exam?type=${encodeURIComponent(quizDef.id)}`)}
          >
            {MODE_LABEL.exam}
          </Button>
        )}

        {quizDef.modes.includes("review") && (
          <Button
            variant="main"
            onClick={() => router.push(`/review?type=${encodeURIComponent(quizDef.id)}`)}
          >
            {MODE_LABEL.review}
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <Button variant="sub" onClick={() => router.push("/")}>
          TOPへ戻る
        </Button>
        <Button variant="sub" onClick={() => router.push("/select-quizzes")}>
          受講教材を選び直す
        </Button>
      </div>
    </QuizLayout>
  )
}
