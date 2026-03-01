// app/(auth)/game/types.ts
export type GameMode = "normal" | "attack"

export type GameDifficulty = "N5" | "N4" | "N3" | "N2" | "N1"

export type GameKind = "tile-drop" | "speed-choice" | "sentence-build"

export type GameQuestionType = "reading" | "fill" | "particle"

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

  // ✅ N4のカテゴリ絞り込みに使う（moji-goi / bunpo / reading / listening）
  sectionId?: string
}
// ✅ Attackランキング用（firestore.ts が参照）
export type LeaderboardEntry = {
  uid: string
  displayName: string
  bestScore: number
  updatedAt?: any
}