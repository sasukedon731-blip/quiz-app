import { gaikoku } from './gaikoku-license'
import { japaneseN4 } from './japanese-n4'

// QuizType を定義（ここで文字列リテラル型として宣言）
export type QuizType = 'gaikoku' | 'japaneseN4'

// quizzes オブジェクトにまとめる
export const quizzes: Record<QuizType, typeof gaikoku | typeof japaneseN4> = {
  gaikoku,
  japaneseN4,
}
