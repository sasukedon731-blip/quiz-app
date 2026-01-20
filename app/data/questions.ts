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
    question: "赤色の逆三角形の標識が示す意味はどれですか？",
    choices: ["一時停止", "徐行", "通行止め", "駐車禁止"],
    correctIndex: 0,
    explanation: "赤色の逆三角形は一時停止を意味します。",
  },
  {
    id: 2,
    question: "横断歩道で歩行者が待っている場合、運転者の正しい行動は？",
    choices: [
      "必ず一時停止する",
      "減速して通過する",
      "クラクションを鳴らす",
      "歩行者が譲るまで進む",
    ],
    correctIndex: 0,
    explanation: "横断歩道では歩行者が最優先です。",
  },
  {
    id: 3,
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
    id: 4,
    question: "信号が黄色になったときの正しい行動は？",
    choices: [
      "安全に停止できるなら停止する",
      "必ず進む",
      "必ず止まる",
      "加速する",
    ],
    correctIndex: 0,
    explanation: "黄色信号は『止まれ』の予告です。",
  },
  {
    id: 5,
    question: "踏切での正しい行動はどれですか？",
    choices: [
      "必ず一時停止し安全確認する",
      "減速のみで通過する",
      "前車について進む",
      "警報が鳴っても進める",
    ],
    correctIndex: 0,
    explanation: "踏切では必ず一時停止が必要です。",
  },
  {
    id: 6,
    question: "雨の日に制動距離はどうなりますか？",
    choices: [
      "長くなる",
      "短くなる",
      "変わらない",
      "天候に関係ない",
    ],
    correctIndex: 0,
    explanation: "路面が滑りやすくなるため制動距離は長くなります。",
  },
  {
    id: 7,
    question: "交差点で右折する際、優先されるのはどれですか？",
    choices: [
      "直進車",
      "右折車",
      "後続車",
      "左折車",
    ],
    correctIndex: 0,
    explanation: "原則として直進車が優先です。",
  },
  {
    id: 8,
    question: "夜間に前照灯を点灯するのはどのタイミングですか？",
    choices: [
      "日没後から日の出まで",
      "暗く感じたときのみ",
      "街灯がないときだけ",
      "雨の日だけ",
    ],
    correctIndex: 0,
    explanation: "夜間は必ず前照灯を点灯します。",
  },
  {
    id: 9,
    question: "駐車と停車の違いとして正しいものは？",
    choices: [
      "運転者が車を離れると駐車",
      "5分以内なら必ず停車",
      "エンジン停止は停車",
      "荷物の積み下ろしは駐車",
    ],
    correctIndex: 0,
    explanation: "運転者が離れると駐車になります。",
  },
  {
    id: 10,
    question: "カーブの手前で行うべき運転は？",
    choices: [
      "十分に減速する",
      "クラクションを鳴らす",
      "加速する",
      "中央に寄る",
    ],
    correctIndex: 0,
    explanation: "見通しの悪い場所では減速が基本です。",
  },
  {
    id: 11,
    question: "シートベルトの着用が義務付けられているのは？",
    choices: [
      "すべての座席",
      "運転席のみ",
      "前席のみ",
      "高速道路のみ",
    ],
    correctIndex: 0,
    explanation: "すべての座席で着用義務があります。",
  },
  {
    id: 12,
    question: "飲酒運転に該当するのはどれですか？",
    choices: [
      "少量でもアルコールが検出される",
      "酔っていなければ問題ない",
      "夜だけ禁止",
      "ビール1杯ならOK",
    ],
    correctIndex: 0,
    explanation: "日本では厳しく禁止されています。",
  },
  {
    id: 13,
    question: "見通しの悪い交差点で必要な行動は？",
    choices: [
      "徐行して安全確認",
      "スピードを上げる",
      "クラクションを鳴らし続ける",
      "止まらず進む",
    ],
    correctIndex: 0,
    explanation: "安全確認が最優先です。",
  },
  {
    id: 14,
    question: "追い越しが禁止されているのはどんな場所ですか？",
    choices: [
      "黄色の実線の道路",
      "直線道路",
      "見通しの良い場所",
      "昼間のみ",
    ],
    correctIndex: 0,
    explanation: "黄色の実線は追い越し禁止です。",
  },
  {
    id: 15,
    question: "警察官の手信号と信号機が異なる場合、従うのは？",
    choices: [
      "警察官の指示",
      "信号機",
      "自分の判断",
      "前の車",
    ],
    correctIndex: 0,
    explanation: "警察官の指示が最優先です。",
  },
  {
    id: 16,
    question: "高速道路での最低速度がある理由は？",
    choices: [
      "交通の流れを保つため",
      "燃費を良くするため",
      "事故は起きないから",
      "夜間対策",
    ],
    correctIndex: 0,
  },
  {
    id: 17,
    question: "交差点内での追い越しは？",
    choices: [
      "原則禁止",
      "自由にできる",
      "昼間のみ可能",
      "高速なら可能",
    ],
    correctIndex: 0,
  },
  {
    id: 18,
    question: "歩行者用信号が青のとき、車はどうする？",
    choices: [
      "歩行者を優先する",
      "先に進む",
      "クラクションを鳴らす",
      "減速不要",
    ],
    correctIndex: 0,
  },
  {
    id: 19,
    question: "雪道で必要な運転操作は？",
    choices: [
      "急操作を避ける",
      "急ブレーキ",
      "急加速",
      "速度を上げる",
    ],
    correctIndex: 0,
  },
  {
    id: 20,
    question: "免許証の携帯義務について正しいのは？",
    choices: [
      "運転時は必ず携帯する",
      "車に置いておけばよい",
      "写真があればOK",
      "コピーでも可",
    ],
    correctIndex: 0,
  },
]
