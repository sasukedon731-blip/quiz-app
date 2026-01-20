export type Question = {
  id: number
  question: string
  choices: string[]
  correctIndex: number
  explanation?: string
}

export const questions: Question[] = [
  {
    id: 1,
    question: "この標識が示す意味はどれですか？",
    choices: ["一時停止", "徐行", "通行止め", "駐車禁止"],
    correctIndex: 0,
    explanation: "赤い逆三角形の標識は一時停止を意味します。",
  },
  {
    id: 2,
    question: "黄色の実線の意味として正しいものはどれですか？",
    choices: [
      "追い越し禁止",
      "駐停車禁止",
      "右折禁止",
      "徐行区間",
    ],
    correctIndex: 0,
    explanation: "黄色の実線は追い越し禁止を示します。",
  },
  {
    id: 3,
    question: "横断歩道の手前で歩行者がいる場合、どうしますか？",
    choices: [
      "必ず一時停止する",
      "減速して通過してよい",
      "クラクションを鳴らす",
      "歩行者が止まるのを待つ",
    ],
    correctIndex: 0,
    explanation: "横断歩道では歩行者優先です。",
  },
  {
    id: 4,
    question: "制限速度50km/hの道路を60km/hで走行した場合どうなりますか？",
    choices: [
      "速度違反になる",
      "問題ない",
      "夜間なら問題ない",
      "追い越し中なら問題ない",
    ],
    correctIndex: 0,
    explanation: "制限速度を超えると速度違反です。",
  },
  {
    id: 5,
    question: "信号が黄色になったときの正しい行動は？",
    choices: [
      "安全に停止できるなら停止する",
      "必ず進む",
      "必ず止まる",
      "スピードを上げる",
    ],
    correctIndex: 0,
    explanation: "黄色信号は『止まれ』の予告です。",
  },

  // 👉 この下にいくらでも追加できます
]
