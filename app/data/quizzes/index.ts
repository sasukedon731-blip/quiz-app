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
import { roadSignsQuiz } from "./road-signs"
import { constructionTermsQuiz } from "./construction-terms"

// ★ 製造教材
import { manufacturingTermsQuiz } from "./manufacturing-terms"
import { manufacturingListeningQuiz } from "./manufacturing-listening"
import { manufacturingConversationQuiz } from "./manufacturing-conversation"
import { skillTestMachiningQuiz } from "./skill-test-machining"

// ★ 介護教材
import { careTermsQuiz } from "./care-terms"
import { careListeningQuiz } from "./care-listening"
import { careConversationQuiz } from "./care-conversation"

// ★ 方言教材
import { dialectListeningQuiz } from "./dialect-listening"
import { kansaiListeningQuiz } from "./kansai-listening"
import { confusingJapaneseQuiz } from "./confusing-japanese"

export const quizzes = {
  "gaikoku-license": gaikokuQuiz,
  "japanese-n4": japaneseN4Quiz,
  "genba-listening": genbaListening,

  "japanese-n3": japaneseN3Quiz,
  "japanese-n2": japaneseN2Quiz,
  "kenchiku-sekou-2kyu-1ji": kenchikuSekou2kyu1ji,
  "doboku-sekou-2kyu-1ji": dobokuSekou2kyu1ji,
  "denki-sekou-2kyu-1ji": denkiSekou2kyu1ji,
  "kanko-sekou-2kyu-1ji": kankoSekou2kyu1ji,
  "speaking-practice": speakingPractice,
  "genba-phrasebook": genbaPhrasebook,
  "construction-terms": constructionTermsQuiz,
  "road-signs": roadSignsQuiz,

  // ★ 製造
  "manufacturing-terms": manufacturingTermsQuiz,
  "manufacturing-listening": manufacturingListeningQuiz,
  "manufacturing-conversation": manufacturingConversationQuiz,
  "skill-test-machining": skillTestMachiningQuiz,

  // ★ 介護
  "care-terms": careTermsQuiz,
  "care-listening": careListeningQuiz,
  "care-conversation": careConversationQuiz,
  "dialect-listening": dialectListeningQuiz,
  "kansai-listening": kansaiListeningQuiz,
  "confusing-japanese": confusingJapaneseQuiz,
} as const
