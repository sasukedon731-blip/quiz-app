import type { Quiz, QuizType } from '../types'
import { gaikokuQuiz } from './gaikoku-license'
import { japaneseN4Quiz } from './japanese-n4'

export const quizzes: Record<QuizType, Quiz> = {
  'gaikoku-license': gaikokuQuiz,
  'japanese-n4': japaneseN4Quiz,
}
