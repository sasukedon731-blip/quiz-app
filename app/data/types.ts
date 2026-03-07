// app/data/types.ts

export type QuizType =
  | "gaikoku-license"
  | "japanese-n4"
  | "genba-listening"
  | "japanese-n3"
  | "japanese-n2"
  | "kenchiku-sekou-2kyu-1ji"
  | "doboku-sekou-2kyu-1ji"
  | "denki-sekou-2kyu-1ji"
  | "kanko-sekou-2kyu-1ji"
  | "speaking-practice"
  | "genba-phrasebook"
  | "road-signs"
  | "construction-terms"
  | "manufacturing-terms"
  | "manufacturing-listening"
  | "manufacturing-conversation"
  | "care-listening"
  | "care-conversation"
  | "care-terms"
  | "skill-test-machining"
  | "dialect-listening"
  | "kansai-listening"
  | "confusing-japanese"

// ✅ 分野（セクション）定義
export type QuizSection = {
  id: string
  label: string
}

export type Question = {
  id: number

  question: string
  choices: string[]
  correctIndex: number
  explanation: string
  signId?: string

  audioUrl?: string
  listeningText?: string

  imageUrl?: string
  imageAlt?: string

  sectionId?: string
}

export type Quiz = {
  id: QuizType
  title: string
  description?: string
  sections?: QuizSection[]
  questions: Question[]
}