import { gaikokuQuiz } from './gaikoku-license'
import { japaneseN4Quiz } from './japanese-n4'
import type { Quiz } from '../types'

export type QuizType = 'gaikoku-license' | 'japanese-n4'

export const quizzes: Record<QuizType, Quiz> = {
  'gaikoku-license': gaikokuQuiz,
  'japanese-n4': japaneseN4Quiz,
}
