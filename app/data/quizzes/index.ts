import { questions as gaikokuLicenseQuestions } from './gaikoku-license'
import { questions as japaneseN4Questions } from './japanese-n4'
import type { Question } from '../types'

export type QuizType = 'gaikoku' | 'japaneseN4'

type QuizData = {
  title: string
  questions: Question[]
}

export const quizzes: Record<QuizType, QuizData> = {
  gaikoku: {
    title: '外国免許切替',
    questions: gaikokuLicenseQuestions,
  },
  japaneseN4: {
    title: '日本語N4',
    questions: japaneseN4Questions,
  },
}

export function getQuizzes(type: QuizType): Question[] {
  return quizzes[type]?.questions ?? []
}
