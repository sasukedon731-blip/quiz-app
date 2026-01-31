import { gaikokuLicense } from './gaikoku-license'
import { japaneseN4 } from './japanese-n4'

export const quizzes = {
  gaikoku: {
    title: '外国免許切替クイズ',
    questions: gaikokuLicense,
  },
  n4: {
    title: '日本語N4クイズ',
    questions: japaneseN4,
  },
}
