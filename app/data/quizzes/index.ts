// app/data/quizzes/index.ts
import { gaikokuQuiz } from "./gaikoku-license"
import { japaneseN4Quiz } from "./japanese-n4"
import { genbaListening } from "./genba-listening"

export const quizzes = {
  "gaikoku-license": gaikokuQuiz,
  "japanese-n4": japaneseN4Quiz,
  "genba-listening": genbaListening,
} as const
