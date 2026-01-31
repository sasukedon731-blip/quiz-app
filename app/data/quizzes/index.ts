import { questions as gaikokuLicenseQuestions } from './gaikoku-license'
import { questions as japaneseN4Questions } from './japanese-n4'
import type { Question } from '../types'

export type Quiz = {
  title: string
  questions: Question[]
}

export const quizzes: Record<string, Quiz> = {
  gaikoku: {
    title: '外国免許切替',
    questions: gaikokuLicenseQuestions
  },
  japaneseN4: {
    title: '日本語N4',
    questions: japaneseN4Questions
  }
}
