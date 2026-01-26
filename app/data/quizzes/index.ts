// app/data/quizzes/index.ts

import { questions as gaikokuLicenseQuestions } from "./gaikoku-license"
import { questions as japaneseN4Questions } from "./japanese-n4"
import type { Question } from "./types"

/**
 * 全クイズ定義の集約
 * ・ここだけ見れば「どんなクイズがあるか」が分かる
 * ・今後クイズが増えてもここに追加するだけ
 */
export const quizzes: {
  [key: string]: {
    title: string
    questions: Question[]
  }
} = {
  gaikoku: {
    title: "外国免許切替",
    questions: gaikokuLicenseQuestions,
  },
  japaneseN4: {
    title: "日本語N4",
    questions: japaneseN4Questions,
  },
}

/**
 * Question 型を外部から使えるように再 export
 * 例:
 * import { quizzes, Question } from '@/app/data/quizzes'
 */
export type { Question }
