import QuizClient from "./QuizClient"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"

export const dynamic = "force-dynamic"

export default function QuizPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const type = (searchParams.type ?? "") as QuizType
  const quiz = (quizzes as any)[type]

  if (!quiz) {
    return (
      <main className="container">
        <p style={{ textAlign: "center", marginTop: 40 }}>クイズ種別がありません</p>
      </main>
    )
  }

  return <QuizClient quiz={quiz} quizType={type} />
}
