import { Quiz } from '../types'
import { gaikokuQuiz } from './gaikoku-license'
import { japaneseN4Quiz } from './japanese-n4'

export const quizzes: Record<'gaikoku-license' | 'japanese-n4', Quiz> = {
  'gaikoku-license': gaikokuQuiz,
  'japanese-n4': japaneseN4Quiz,
}
