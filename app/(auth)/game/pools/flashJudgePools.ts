// app/(auth)/game/pools/flashJudgePools.ts
import type { QuizType } from "@/app/data/types"
import type { FlashJudgeQuestion } from "../types"

// ✅ まずは N4 の実運用を想定したサンプルを同梱
// - 将来は Firestore / 管理画面 から差し替え可能

export const flashJudgePools: Partial<Record<QuizType, FlashJudgeQuestion[]>> = {
  "japanese-n4": [
    {
      id: "fj-n4-001",
      kind: "flash-judge",
      sectionId: "bunpo",
      prompt: "日本へ行くのを楽しみにしています。",
      answer: true,
      explanation: "「〜のを楽しみにしています」で自然な文です。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "fj-n4-002",
      kind: "flash-judge",
      sectionId: "bunpo",
      prompt: "昨日は雨が降るです。",
      answer: false,
      explanation: "「降るです」は誤り。「雨が降りました」などにします。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "fj-n4-003",
      kind: "flash-judge",
      sectionId: "bunpo",
      prompt: "ここで写真をとらないでください。",
      answer: true,
      explanation: "禁止の依頼表現「〜ないでください」で自然です。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "fj-n4-004",
      kind: "flash-judge",
      sectionId: "bunpo",
      prompt: "駅で友だちを会いました。",
      answer: false,
      explanation: "「会う」は「〜に会いました」。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "fj-n4-005",
      kind: "flash-judge",
      sectionId: "reading",
      prompt: "『今日は暑いので、窓を閉めました。』",
      answer: false,
      explanation: "暑いなら普通は窓を開けます。文脈として不自然。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "fj-n4-006",
      kind: "flash-judge",
      sectionId: "reading",
      prompt: "『このバスは駅前に止まりません。』",
      answer: true,
      explanation: "文として自然です。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "fj-n4-007",
      kind: "flash-judge",
      sectionId: "moji-goi",
      prompt: "『大丈夫です』は「問題ありません」という意味です。",
      answer: true,
      explanation: "一般的にその意味で使われます（断りの意味にもなる点は上級で扱う）。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
    {
      id: "fj-n4-008",
      kind: "flash-judge",
      sectionId: "bunpo",
      prompt: "明日、雨が降るなら、出かけません。",
      answer: true,
      explanation: "条件「〜なら」で自然です。",
      difficulty: "N4",
      enabled: true,
      quizType: "japanese-n4",
    },
  ],
}

export function getFlashJudgePool(quizType: QuizType) {
  const list = flashJudgePools[quizType] ?? []
  return list.filter((q) => q.enabled)
}
