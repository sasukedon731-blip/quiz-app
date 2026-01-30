import { questions as gaikokuLicenseQuestions } from './gaikoku-license'
import { questions as japaneseN4Questions } from './japanese-n4'
import type { Question } from '../types'

export const quizzes: Record<string, { title: string; questions: Question[] }> = {
  gaikoku: {
    title: "外国免許切替",
    questions: gaikokuLicenseQuestions
  },
  japaneseN4: {
    title: "日本語N4",
    questions: japaneseN4Questions
  }
}
