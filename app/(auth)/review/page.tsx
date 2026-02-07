import ReviewClient from "./ReviewClient"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"

export const dynamic = "force-dynamic"

export default function ReviewPage({
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

  return <ReviewClient quizType={type} />
}
