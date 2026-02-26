// app/(auth)/game/types.ts

export type GameMode = "normal" | "attack"

export type GameDifficulty = "N5" | "N4" | "N3" | "N2" | "N1"

// ✅ ゲーム種類（今後ここが増える）
export type GameKind =
  | "tile-drop"      // 落ちゲー（テンポ命）
  | "speed-choice"   // 4択スピード（漢字・語彙に強い）
  | "sentence-build" // 並び替え（文法・語順に強い）

export type GameQuestionType = "reading" | "fill" | "particle"

// ✅ GameQuestion（ゲーム用に短文化済み前提）
export type GameQuestion = {
  id: string
  kind: GameKind
  type: GameQuestionType

  prompt: string
  answer: string[]
  choices: string[]

  difficulty: GameDifficulty
  enabled: boolean
  quizType?: string
}

// ✅ Attackランキング用（firestore.ts が参照）
export type LeaderboardEntry = {
  uid: string
  displayName: string
  bestScore: number
  updatedAt?: any
}