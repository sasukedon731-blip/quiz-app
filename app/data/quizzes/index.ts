import type { Quiz, QuizType } from "@/app/data/types"
import { gaikokuQuiz } from "@/app/data/quizzes/gaikoku-license"
import { japaneseN4Quiz } from "@/app/data/quizzes/japanese-n4"

export const quizzes: Record<QuizType, Quiz> = {
  "gaikoku-license": gaikokuQuiz,
  "japanese-n4": japaneseN4Quiz,
}
