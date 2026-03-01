// app/(auth)/game/pools/memoryBurstPools.ts
import type { QuizType } from "@/app/data/types"
import type { MemoryBurstQuestion } from "../types"

export const memoryBurstPools: Partial<Record<QuizType, MemoryBurstQuestion[]>> = {
  "japanese-n4": [
    {
      id: "mb-n4-001",
      kind: "memory-burst",
      sectionId: "reading",
      displayText: "明日は朝7時に駅で友だちと会います。",
      question: "何時に会いますか？",
      choices: ["6時", "7時", "8時", "9時"],
      correctIndex: 1,
      explanation: "文に「朝7時に」とあります。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "mb-n4-002",
      kind: "memory-burst",
      sectionId: "reading",
      displayText: "この店は日曜日は休みですが、祝日は営業しています。",
      question: "祝日はどうですか？",
      choices: ["営業しています", "休みです", "午後だけ営業", "わからない"],
      correctIndex: 0,
      explanation: "「祝日は営業しています」と書いてあります。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "mb-n4-003",
      kind: "memory-burst",
      sectionId: "moji-goi",
      displayText: "工事中なので、この道は通れません。",
      question: "この道はどうですか？",
      choices: ["通れない", "安全", "新しい", "広い"],
      correctIndex: 0,
      explanation: "「通れません」＝通れない。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "mb-n4-004",
      kind: "memory-burst",
      sectionId: "bunpo",
      displayText: "会議が長いので、あとで連絡します。",
      question: "いつ連絡しますか？",
      choices: ["今すぐ", "あとで", "昨日", "連絡しない"],
      correctIndex: 1,
      explanation: "「あとで連絡します」とあります。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
  ],
}

export function getMemoryBurstPool(quizType: QuizType) {
  const list = memoryBurstPools[quizType] ?? []
  return list.filter((q) => q.enabled)
}
