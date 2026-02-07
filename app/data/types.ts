// app/data/types.ts

export type QuizType =
  | "gaikoku-license"
  | "japanese-n4"
  | "genba-listening"

export type Question = {
  // ✅ ここが重要：既存資産に合わせて number に戻す
  id: number

  question: string
  choices: string[]
  correctIndex: number
  explanation: string

  // ✅ Listening対応（MP3がなくてもOK）
  audioUrl?: string        // 将来: public にMP3を置いたら使う
  listeningText?: string   // 今: ブラウザ読み上げ用
}

export type Quiz = {
  title: string
  description?: string
  questions: Question[]
}
