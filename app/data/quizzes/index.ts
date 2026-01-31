import { gaikoku } from './gaikoku-license'
import { japaneseN4 } from './japanese-n4'
import type { Question } from '../types'

export const quizzes = {
  gaikoku,
  japaneseN4,
} satisfies Record<string, Question[]>

export type QuizType = keyof typeof quizzes
