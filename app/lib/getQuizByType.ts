import { quizzes } from "@/app/data/quizzes"
import type { Quiz, QuizType } from "@/app/data/types"

/**
 * QuizType → 実体 Quiz（questions 含む）を取得
 */
export function getQuizByType(type: QuizType): Quiz | null {
  return quizzes[type] ?? null
}
