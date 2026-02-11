// app/data/types.ts

export type QuizType =
  | "gaikoku-license"
  | "japanese-n4"
  | "genba-listening"

export type Question = {
  // ✅ 既存資産に合わせて number 維持（Review 側も耐性あり）
  id: number

  question: string
  choices: string[]
  correctIndex: number
  explanation: string

  // ✅ Listening対応（MP3がなくてもOK）
  audioUrl?: string
  listeningText?: string
}

export type Quiz = {
  // ✅ 追加：quiz の唯一の真実（URL / Firestore / localStorage のキー）
  id: QuizType

  title: string
  description?: string
  questions: Question[]
}
