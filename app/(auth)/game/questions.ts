import type { GameQuestion } from "./types"

// Fallback questions (used if Firestore is empty or offline)
export const fallbackQuestions: GameQuestion[] = [
  {
    id: "fb-n5-1",
    type: "reading",
    prompt: "現場",
    answer: ["げ", "ん", "ば"],
    choices: ["げ", "ん", "ば", "け", "き", "み"],
    difficulty: "N5",
    enabled: true,
  },
  {
    id: "fb-n5-2",
    type: "fill",
    prompt: "安全第（ ）",
    answer: ["一"],
    choices: ["一", "二", "三", "十"],
    difficulty: "N5",
    enabled: true,
  },
  {
    id: "fb-n4-1",
    type: "particle",
    prompt: "3階（ ）行って",
    answer: ["に"],
    choices: ["に", "へ", "を", "で"],
    difficulty: "N4",
    enabled: true,
  },
  {
    id: "fb-n4-2",
    type: "reading",
    prompt: "工事",
    answer: ["こ", "う", "じ"],
    choices: ["こ", "う", "じ", "き", "さ", "し"],
    difficulty: "N4",
    enabled: true,
  },
  {
    id: "fb-n3-1",
    type: "particle",
    prompt: "日本（ ）来ました",
    answer: ["に"],
    choices: ["に", "を", "で", "から"],
    difficulty: "N3",
    enabled: true,
  },
]
