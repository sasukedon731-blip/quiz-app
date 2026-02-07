"use client"

import { useSearchParams, useRouter } from "next/navigation"
import ReviewClient from "./ReviewClient"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"

export default function ReviewClientWrapper() {
  const router = useRouter()
  const params = useSearchParams()
  const typeRaw = params.get("type")

  const quiz = typeRaw ? quizzes[typeRaw as QuizType] : undefined
  if (!quiz) {
    return (
      <main className="container">
        <p style={{ textAlign: "center", marginTop: 40 }}>
          クイズ種別がありません（type={String(typeRaw)}）
        </p>
        <p style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={() => router.push("/")}>HOMEへ戻る</button>
        </p>
      </main>
    )
  }

  return <ReviewClient quizType={typeRaw as QuizType} />
}
