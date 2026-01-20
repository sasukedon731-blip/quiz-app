// app/data/questions.ts

export type Question = {
  question: string
  choices: string[]
  correctIndex: number
  explanation?: string
}

export const questions: Question[] = [
  {
    question: "夜間に前照灯（ライト）を点灯しなければならないのはいつですか？",
    choices: [
      "日没から日の出まで",
      "雨が降っているときだけ",
      "トンネル内だけ",
    ],
    correctIndex: 0,
    explanation: "夜間は日没から日の出まで、前照灯を点灯する義務があります。",
  },
  {
    question: "横断歩道に歩行者がいる場合、車はどうしなければなりませんか？",
    choices: [
      "クラクションを鳴らして進む",
      "一時停止または減速して歩行者を優先する",
      "歩行者が止まるまで進む",
    ],
    correctIndex: 1,
    explanation: "横断歩道では歩行者が最優先です。",
  },
  {
    question: "制限速度が定められていない一般道路の最高速度は何km/hですか？",
    choices: ["40km/h", "50km/h", "60km/h"],
    correctIndex: 2,
    explanation: "日本の一般道路の法定最高速度は60km/hです。",
  },
  {
    question: "信号が黄色に変わったとき、正しい行動はどれですか？",
    choices: [
      "必ず急ブレーキで止まる",
      "安全に停止できる場合は停止する",
      "そのまま加速して進む",
    ],
    correctIndex: 1,
    explanation:
      "黄色信号は「止まれ」の意味で、安全に停止できる場合は停止します。",
  },
  {
    question: "踏切を通過する前に必ず行うべきことはどれですか？",
    choices: [
      "一時停止して安全確認",
      "徐行のみ",
      "警報音が鳴っていなければそのまま通過",
    ],
    correctIndex: 0,
    explanation: "踏切では必ず一時停止し、左右の安全確認を行います。",
  },
]
