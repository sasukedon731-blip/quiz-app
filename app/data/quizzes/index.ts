import type { Quiz, QuizType } from '../types'
import gaikokuLicense from './gaikoku-license'
import japaneseN4 from './japanese-n4'

export const quizzes: Record<QuizType, Quiz> = {
  'gaikoku-license': gaikokuLicense,
  'japanese-n4': japaneseN4,
}
