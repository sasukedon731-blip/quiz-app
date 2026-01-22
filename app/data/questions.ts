export type Question = {
  id: number
  question: string
  choices: string[]
  correctIndex: number
}

export const questions: Question[] = [
  {
    id: 1,
    question: '日本の道路で原則となっている通行方法はどれですか？',
    choices: ['右側通行', '左側通行', '中央通行', '自由通行'],
    correctIndex: 1,
  },
  {
    id: 2,
    question: '信号機の黄色の意味として正しいものはどれですか？',
    choices: ['進んでもよい', '必ず止まれ', '止まれの準備をする', '徐行して進め'],
    correctIndex: 2,
  },
  {
    id: 3,
    question: '横断歩道で正しい行動はどれですか？',
    choices: ['歩行者を優先する', 'クラクションを鳴らす', 'スピードを上げる', '歩行者に合図する'],
    correctIndex: 0,
  },
  {
    id: 4,
    question: '一般道路の法定速度はどれですか？',
    choices: ['40km/h', '50km/h', '60km/h', '80km/h'],
    correctIndex: 2,
  },
  {
    id: 5,
    question: '追い越しが禁止されている場所はどれですか？',
    choices: ['直線道路', '坂の頂上付近', '片側2車線', '見通しの良い道'],
    correctIndex: 1,
  },
  {
    id: 6,
    question: '赤信号の意味はどれですか？',
    choices: ['注意して進め', '必ず停止', '徐行', '優先道路'],
    correctIndex: 1,
  },
  {
    id: 7,
    question: '雨天時に制動距離が長くなる理由は？',
    choices: ['タイヤが軽くなる', '路面が滑りやすい', 'ブレーキ性能向上', '視界が良い'],
    correctIndex: 1,
  },
  {
    id: 8,
    question: 'シートベルトの着用義務は？',
    choices: ['運転席のみ', '前席のみ', '全座席', '高速道路のみ'],
    correctIndex: 2,
  },
  {
    id: 9,
    question: '運転中の携帯電話使用は？',
    choices: ['許可されている', '条件付きで可', '違反になる', '夜のみ違反'],
    correctIndex: 2,
  },
  {
    id: 10,
    question: '一時停止標識がある場所では？',
    choices: ['徐行する', '完全停止', '左右どちらか確認', '警音器を鳴らす'],
    correctIndex: 1,
  },

  {
    id: 11,
    question: '夜間、対向車がいるときのライトは？',
    choices: ['ハイビーム', 'ロービーム', '消灯', 'スモール'],
    correctIndex: 1,
  },
  {
    id: 12,
    question: '踏切通過時の正しい行動は？',
    choices: ['左右確認', '止まらず進む', '警報無視', 'クラクション'],
    correctIndex: 0,
  },
  {
    id: 13,
    question: '飲酒運転について正しいものは？',
    choices: ['少量なら可', '昼間なら可', '一切禁止', 'ビール1杯可'],
    correctIndex: 2,
  },
  {
    id: 14,
    question: '駐車禁止場所は？',
    choices: ['自宅前', '交差点5m以内', '駐車場', '道路左側'],
    correctIndex: 1,
  },
  {
    id: 15,
    question: '右折時の正しい方法は？',
    choices: ['左端から', '中央に寄る', '歩行者無視', '速度を上げる'],
    correctIndex: 1,
  },

  {
    id: 16,
    question: '高速道路での最低速度は？',
    choices: ['30km/h', '40km/h', '50km/h', '60km/h'],
    correctIndex: 2,
  },
  {
    id: 17,
    question: 'サイレンを鳴らした緊急車両が来たら？',
    choices: ['止まらない', '道を譲る', '追い越す', '無視する'],
    correctIndex: 1,
  },
  {
    id: 18,
    question: '雨の日に適切な運転は？',
    choices: ['スピードを上げる', '車間距離をとる', '急ブレーキ', '急発進'],
    correctIndex: 1,
  },
  {
    id: 19,
    question: '徐行とはどのような運転？',
    choices: ['止まる', 'すぐ止まれる速度', '法定速度', '一定速度'],
    correctIndex: 1,
  },
  {
    id: 20,
    question: '踏切内でエンストしたら？',
    choices: ['そのまま待つ', '非常ボタンを押す', '押して動かす', '電車を待つ'],
    correctIndex: 1,
  },

  {
    id: 21,
    question: '夜間に歩行者が見えにくい理由は？',
    choices: ['反射材不足', '速度が遅い', '歩行者が少ない', '街灯が多い'],
    correctIndex: 0,
  },
  {
    id: 22,
    question: '道路工事現場での注意点は？',
    choices: ['通常走行', '警備員の指示に従う', 'スピードを上げる', '無視する'],
    correctIndex: 1,
  },
  {
    id: 23,
    question: '子どもが近くにいるときは？',
    choices: ['通常運転', '注意して徐行', 'クラクション', '無視'],
    correctIndex: 1,
  },
  {
    id: 24,
    question: '制限速度を超えて走ると？',
    choices: ['問題ない', '違反になる', '夜は可', '雨の日可'],
    correctIndex: 1,
  },
  {
    id: 25,
    question: '歩行者専用道路を走行すると？',
    choices: ['問題ない', '条件付き可', '違反', '夜のみ可'],
    correctIndex: 2,
  },

  {
    id: 26,
    question: '安全確認で最も重要なのは？',
    choices: ['ミラー', '目視', '音', '勘'],
    correctIndex: 1,
  },
  {
    id: 27,
    question: '右折禁止標識がある場合は？',
    choices: ['右折可', '左折のみ可', 'Uターン可', '自由'],
    correctIndex: 1,
  },
  {
    id: 28,
    question: '見通しの悪い交差点では？',
    choices: ['加速', '徐行', '停止不要', 'クラクション'],
    correctIndex: 1,
  },
  {
    id: 29,
    question: '駐車中にエンジンをかけたままにすると？',
    choices: ['問題なし', '違反の場合あり', '推奨', '必須'],
    correctIndex: 1,
  },
  {
    id: 30,
    question: '交差点での優先順位は？',
    choices: ['車が優先', '歩行者優先', '自転車優先', '先着順'],
    correctIndex: 1,
  },

  {
    id: 31,
    question: '路面が凍結している場合は？',
    choices: ['通常運転', '急操作', '慎重に運転', '速度を上げる'],
    correctIndex: 2,
  },
  {
    id: 32,
    question: '車間距離を十分に取る理由は？',
    choices: ['燃費向上', '安全確保', '追い越し防止', '速度維持'],
    correctIndex: 1,
  },
  {
    id: 33,
    question: '急ブレーキを避ける理由は？',
    choices: ['疲れる', '後続車危険', '燃費悪化', '遅れる'],
    correctIndex: 1,
  },
  {
    id: 34,
    question: '見通しの悪いカーブでは？',
    choices: ['加速', '減速', '追い越し', '通常走行'],
    correctIndex: 1,
  },
  {
    id: 35,
    question: '道路標識の目的は？',
    choices: ['装飾', '注意喚起', '広告', '景観'],
    correctIndex: 1,
  },

  {
    id: 36,
    question: '安全運転義務とは？',
    choices: ['自由運転', '安全に配慮', '早く走る', '譲らない'],
    correctIndex: 1,
  },
  {
    id: 37,
    question: '自転車の扱いは？',
    choices: ['歩行者', '軽車両', '車両でない', '例外'],
    correctIndex: 1,
  },
  {
    id: 38,
    question: '交差点での合図は？',
    choices: ['不要', '早めに出す', '直前', '出さない'],
    correctIndex: 1,
  },
  {
    id: 39,
    question: 'スピードを出しすぎると？',
    choices: ['安全', '危険', '早く着く', '問題ない'],
    correctIndex: 1,
  },
  {
    id: 40,
    question: '運転前に必要な確認は？',
    choices: ['燃料', '体調', '両方', '不要'],
    correctIndex: 2,
  },

  {
    id: 41,
    question: '信号のない交差点では？',
    choices: ['優先道路確認', '加速', '止まらない', '無視'],
    correctIndex: 0,
  },
  {
    id: 42,
    question: '夜間にハイビームを使う目的は？',
    choices: ['対向車妨害', '視界確保', '節電', '合図'],
    correctIndex: 1,
  },
  {
    id: 43,
    question: '道路が混雑しているときは？',
    choices: ['割り込む', '譲り合う', 'クラクション', '加速'],
    correctIndex: 1,
  },
  {
    id: 44,
    question: '高齢者マークを見たら？',
    choices: ['無視', '配慮する', '追い越す', 'クラクション'],
    correctIndex: 1,
  },
  {
    id: 45,
    question: '合流時の正しい行動は？',
    choices: ['止まる', '譲り合う', '加速のみ', '無視'],
    correctIndex: 1,
  },

  {
    id: 46,
    question: '視界が悪いときは？',
    choices: ['速度維持', '減速', '加速', '通常'],
    correctIndex: 1,
  },
  {
    id: 47,
    question: '歩行者が多い場所では？',
    choices: ['注意運転', '通常運転', '加速', '無視'],
    correctIndex: 0,
  },
  {
    id: 48,
    question: '交通ルールを守る目的は？',
    choices: ['罰を避ける', '安全確保', '早く着く', '義務'],
    correctIndex: 1,
  },
  {
    id: 49,
    question: '運転中に眠くなったら？',
    choices: ['我慢', '休憩', '加速', '音楽'],
    correctIndex: 1,
  },
  {
    id: 50,
    question: '安全運転で最も大切な心構えは？',
    choices: ['急ぐ', '譲り合い', '競争', '自己優先'],
    correctIndex: 1,
  },
]
