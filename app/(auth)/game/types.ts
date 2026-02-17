export type GameMode = "normal" | "attack"
export type GameDifficulty = "N5" | "N4" | "N3" | "N2" | "N1"

export type GameQuestionType = "reading" | "fill" | "particle"

export type GameQuestion = {
  id: string
  type: GameQuestionType
  prompt: string
  answer: string[] // sequence of tiles to press in order
  choices: string[] // tile pool (answer + dummies)
  difficulty: GameDifficulty
  enabled: boolean
}

export type LeaderboardEntry = {
  uid: string
  displayName: string
  bestScore: number
  updatedAt?: any
}
