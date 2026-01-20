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
    question: "黄色信号の意味として正しいものはどれ？",
    choices: [
      "進んでもよい",
      "止まれ",
      "注意して進め",
      "徐行せよ"
    ],
    correctIndex: 1,
    explanation: "黄色信号は『止まれ』の意味で、止まれない場合のみ進行します。"
  },
  {
    id: 2,
    question: "赤信号でできる行為はどれ？",
    choices: [
      "直進",
      "右折",
      "左折（条件付き）",
      "Uターン"
    ],
    correctIndex: 2,
    explanation: "赤信号でも左折は可能ですが、歩行者や車両の妨げにならないことが条件です。"
  },
  {
    id: 3,
    question: "横断歩道で正しい行動はどれ？",
    choices: [
      "歩行者より車が優先",
      "歩行者がいなくても減速不要",
      "歩行者がいれば必ず停止",
      "クラクションで注意する"
    ],
    correctIndex: 2
  },
  {
    id: 4,
    question: "制限速度が標識で指定されていない一般道路の最高速度は？",
    choices: [
      "40km/h",
      "50km/h",
      "60km/h",
      "80km/h"
    ],
    correctIndex: 2
  },
  {
    id: 5,
    question: "『止まれ』の標識がある場所で正しい行動は？",
    choices: [
      "減速のみでよい",
      "一時停止線で完全に停止",
      "左右確認のみ",
      "クラクションを鳴らす"
    ],
    correctIndex: 1
  },
  {
    id: 6,
    question: "一方通行の道路で正しいものはどれ？",
    choices: [
      "自転車は逆走できる",
      "原付は逆走できる",
      "標識に従う必要がある",
      "歩行者も通行不可"
    ],
    correctIndex: 2
  },
  {
    id: 7,
    question: "踏切を通過するとき正しい行動は？",
    choices: [
      "徐行して進む",
      "一時停止して確認",
      "警報音が鳴っても進行",
      "前の車についていく"
    ],
    correctIndex: 1
  },
  {
    id: 8,
    question: "雨の日に特に注意すべきことは？",
    choices: [
      "制動距離が短くなる",
      "制動距離が長くなる",
      "タイヤが乾く",
      "視界が良くなる"
    ],
    correctIndex: 1
  },
  {
    id: 9,
    question: "夜間運転で正しい行動は？",
    choices: [
      "常にハイビーム",
      "市街地でもハイビーム",
      "状況に応じてライト切替",
      "ライト不要"
    ],
    correctIndex: 2
  },
  {
    id: 10,
    question: "シートベルト着用が義務付けられているのは？",
    choices: [
      "運転席のみ",
      "助手席のみ",
      "後部座席のみ",
      "全席"
    ],
    correctIndex: 3
  },

  // ここから追加問題（同じ形式で増やせる）
  {
    id: 11,
    question: "スマートフォンを操作しながら運転すると？",
    choices: [
      "問題ない",
      "条件付きで可能",
      "違反になる",
      "夜間のみ可能"
    ],
    correctIndex: 2
  },
  {
    id: 12,
    question: "交差点で右折するとき正しい方法は？",
    choices: [
      "左側を通る",
      "交差点の中央を通る",
      "歩行者の後ろを通る",
      "信号を無視する"
    ],
    correctIndex: 1
  },
  {
    id: 13,
    question: "飲酒運転について正しいものは？",
    choices: [
      "少量なら問題ない",
      "自転車なら問題ない",
      "絶対に禁止",
      "夜だけ禁止"
    ],
    correctIndex: 2
  },
  {
    id: 14,
    question: "緊急車両が近づいてきたときの対応は？",
    choices: [
      "そのまま走行",
      "加速する",
      "道路の左側に寄って停止",
      "右に避ける"
    ],
    correctIndex: 2
  },
  {
    id: 15,
    question: "高速道路での最低速度は？",
    choices: [
      "40km/h",
      "50km/h",
      "60km/h",
      "80km/h"
    ],
    correctIndex: 2
  },
  {
    id: 16,
    question: "車間距離を十分に取る理由は？",
    choices: [
      "燃費向上",
      "追い越し防止",
      "追突防止",
      "速度維持"
    ],
    correctIndex: 2
  },
  {
    id: 17,
    question: "歩行者専用道路でできる行為は？",
    choices: [
      "自動車通行",
      "原付通行",
      "歩行のみ",
      "自転車通行"
    ],
    correctIndex: 2
  },
  {
    id: 18,
    question: "標識がない交差点で優先されるのは？",
    choices: [
      "右から来る車",
      "左から来る車",
      "直進車",
      "早い車"
    ],
    correctIndex: 1
  },
  {
    id: 19,
    question: "制限速度を超えて走行すると？",
    choices: [
      "注意のみ",
      "違反になる",
      "夜ならOK",
      "高速道路ならOK"
    ],
    correctIndex: 1
  },
  {
    id: 20,
    question: "雨の日にブレーキをかけると？",
    choices: [
      "止まりやすい",
      "滑りやすい",
      "変化なし",
      "タイヤが軽くなる"
    ],
    correctIndex: 1
  }
]
