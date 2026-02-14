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

// ✅ 分野（セクション）定義
export type QuizSection = {
  id: string      // 例: "law" / "vocab" / "grammar" など（URL/保存に使う）
  label: string   // 表示名（日本語OK）
}

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

  // ✅ 追加：分野ID（未設定なら「全体」扱い）
  sectionId?: string
}

export type Quiz = {
  // ✅ 追加：quiz の唯一の真実（URL / Firestore / localStorage のキー）
  id: QuizType

  title: string
  description?: string

  // ✅ 追加：この教材に存在する分野一覧（無い場合は分野UIを出さない）
  sections?: QuizSection[]

  questions: Question[]
}
