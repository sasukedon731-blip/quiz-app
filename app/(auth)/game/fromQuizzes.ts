import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import type { GameQuestion } from "./types"

export function buildGamePoolFromQuizzes(quizType: QuizType): GameQuestion[] {
  const quiz = quizzes[quizType]
  if (!quiz) return []

  return quiz.questions.map((qq, index) => {
    const correct = qq.choices[qq.correctIndex]

    return {
      id: `${quizType}-${index}`,
      quizType,
      type: "fill",
      prompt: qq.question,
      answer: [correct],
      choices: qq.choices,
      difficulty: "N5",
      enabled: true, // ← これを追加
    }
  })
}
