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
  | "construction-terms-reverse"
  | "construction-terms-image"

  // ★ 今回追加した建設用語PPT抽出教材
  | "construction-tools"
  | "hvac-terms"
  | "plant-terms"
  | "architecture-terms"
  | "construction-management-terms"
  | "electric-terms"
  | "civil-terms"

  // ★ 製造（旧 manufacturing-terms は削除）
  | "manufacturing-meaning"
  | "manufacturing-word"
  | "manufacturing-listening"
  | "manufacturing-conversation"
  | "manufacturing-conversation-50"

  | "care-listening"
  | "care-conversation"
  | "care-terms"
  | "skill-test-machining"
  | "dialect-meaning"
  | "kansai-listening"
  | "confusing-japanese"
  | "care-worker-exam"

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
  correctIndex?: number
  correctIndexes?: number[]
  explanation: string
  explanationEn?: string
  point?: string
  trap?: string
  signId?: string

  // ✅ Listening対応（MP3がなくてもOK）
  audioUrl?: string
  listeningText?: string

  // ✅ 画像対応（イラスト問題・聴解の状況図など）
  imageUrl?: string
  imageAlt?: string

  // ✅ 追加：4択の選択用画像（電気施工など）
  choiceImageUrl?: string
  choiceImageAlt?: string

  // ✅ 追加：解説用画像
  explanationImageUrl?: string
  explanationImageAlt?: string

  // ✅ 追加：分野ID（未設定なら「全体」扱い）
  sectionId?: string

  // ★ PPT抽出クイズ用
  kind?: "description" | "term" | "image"
  hint?: string
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
