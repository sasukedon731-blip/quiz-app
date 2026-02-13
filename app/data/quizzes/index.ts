// app/data/quizzes/index.ts
import { gaikokuQuiz } from "./gaikoku-license"
import { japaneseN4Quiz } from "./japanese-n4"
import { genbaListening } from "./genba-listening"

import { japaneseN3Quiz } from "./japanese-n3"
import { japaneseN2Quiz } from "./japanese-n2"
import { kenchikuSekou2kyu1ji } from "./kenchiku-sekou-2kyu-1ji"
import { dobokuSekou2kyu1ji } from "./doboku-sekou-2kyu-1ji"
import { denkiSekou2kyu1ji } from "./denki-sekou-2kyu-1ji"
import { kankoSekou2kyu1ji } from "./kanko-sekou-2kyu-1ji"
import { speakingPractice } from "./speaking-practice"
import { genbaPhrasebook } from "./genba-phrasebook"

export const quizzes = {
  "gaikoku-license": gaikokuQuiz,
  "japanese-n4": japaneseN4Quiz,
  "genba-listening": genbaListening,

  // 追加（10+教材の箱）
  "japanese-n3": japaneseN3Quiz,
  "japanese-n2": japaneseN2Quiz,
  "kenchiku-sekou-2kyu-1ji": kenchikuSekou2kyu1ji,
  "doboku-sekou-2kyu-1ji": dobokuSekou2kyu1ji,
  "denki-sekou-2kyu-1ji": denkiSekou2kyu1ji,
  "kanko-sekou-2kyu-1ji": kankoSekou2kyu1ji,
  "speaking-practice": speakingPractice,
  "genba-phrasebook": genbaPhrasebook,
} as const
