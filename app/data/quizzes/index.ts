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
import { constructionTermsReverseQuiz } from "./construction-terms_reverse"
import { constructionTermsImageQuiz } from "./construction-terms-image"

import constructionTools from "./construction-tools.quiz"
import hvacTerms from "./hvac-terms.quiz"
import plantTerms from "./plant-terms.quiz"
import architectureTerms from "./architecture-terms.quiz"
import constructionManagementTerms from "./construction-management-terms.quiz"
import electricTerms from "./electric-terms.quiz"
import civilTerms from "./civil-terms.quiz"

// ★ 製造教材
import { manufacturingMeaningQuiz } from "./manufacturing-meaning-150"
import { manufacturingWordQuiz } from "./manufacturing-word-100"
import { manufacturingListeningQuiz } from "./manufacturing-listening"
import { manufacturingConversationQuiz } from "./manufacturing-conversation"
import { manufacturingConversation as manufacturingConversation50 } from "./manufacturing-conversation-50"
import { skillTestMachiningQuiz } from "./skill-test-machining"

// ★ 介護教材
import { careTermsQuiz } from "./care-terms"
import { careListeningQuiz } from "./care-listening"
import { careConversationQuiz } from "./care-conversation"
import { careWorkerExamQuiz } from "./care-worker-exam"

// ★ 方言教材
import { dialectListeningQuiz } from "./dialect-listening"
import { kansaiListeningQuiz } from "./kansai-listening"
import { dialectMeaningQuiz } from "./dialect-meaning"
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
  "construction-terms-reverse": constructionTermsReverseQuiz,
  "construction-terms-image": constructionTermsImageQuiz,
  "road-signs": roadSignsQuiz,

  "construction-tools": constructionTools,
  "hvac-terms": hvacTerms,
  "plant-terms": plantTerms,
  "architecture-terms": architectureTerms,
  "construction-management-terms": constructionManagementTerms,
  "electric-terms": electricTerms,
  "civil-terms": civilTerms,

  "manufacturing-meaning": manufacturingMeaningQuiz,
  "manufacturing-word": manufacturingWordQuiz,
  "manufacturing-listening": manufacturingListeningQuiz,
  "manufacturing-conversation": manufacturingConversationQuiz,
  "manufacturing-conversation-50": manufacturingConversation50,
  "skill-test-machining": skillTestMachiningQuiz,

  "care-terms": careTermsQuiz,
  "care-listening": careListeningQuiz,
  "care-conversation": careConversationQuiz,
  "care-worker-exam": careWorkerExamQuiz,

  "dialect-listening": dialectListeningQuiz,
  "kansai-listening": kansaiListeningQuiz,
  "dialect-meaning": dialectMeaningQuiz,
  "confusing-japanese": confusingJapaneseQuiz,
} as const