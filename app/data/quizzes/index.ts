import { gaikoku } from "./gaikoku-license"
import { japaneseN4 } from "./japanese-n4"

export const quizzes = {
  gaikoku,
  japaneseN4,
}

export type QuizType = keyof typeof quizzes
