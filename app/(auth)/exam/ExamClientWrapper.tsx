"use client"

import { useSearchParams, useRouter } from "next/navigation"
import ExamClient from "./ExamClient"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"

function isQuizType(v: string): v is QuizType {
  return v in quizzes
}

export default function ExamClientWrapper() {
  const router = useRouter()
  const params = useSearchParams()
  const typeRaw = params.get("type")

  if (!typeRaw || !isQuizType(typeRaw)) {
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

  const quiz = quizzes[typeRaw]
  return <ExamClient quiz={quiz} />
}
