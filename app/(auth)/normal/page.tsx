import NormalClient from "./NormalClient"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"

export const dynamic = "force-dynamic"

export default function Page({ searchParams }: { searchParams: { type?: string } }) {
  const typeRaw = searchParams.type
  const quiz = typeRaw ? quizzes[typeRaw as QuizType] : undefined

  if (!quiz) {
    return (
      <main className="container">
        <p style={{ textAlign: "center", marginTop: 40 }}>
          クイズ種別がありません（type={String(typeRaw)}）
        </p>
      </main>
    )
  }

  return <NormalClient quiz={quiz} quizType={typeRaw as QuizType} />
}
