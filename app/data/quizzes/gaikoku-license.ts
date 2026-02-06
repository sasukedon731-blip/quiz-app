import type { Quiz } from "@/app/data/types"

export const gaikokuQuiz: Quiz = {
  title: "外国免許切替",
  questions: [
    {
    id: 1,
    question: "日本で車はどちら側を通行しますか？",
    choices: ["右側", "左側", "真ん中", "決まりはない"],
    correctIndex: 1,
    explanation: "日本では左側通行です。"
  },
  {
    id: 2,
    question: "赤信号の意味はどれですか？",
    choices: ["注意して進む", "必ず止まる", "徐行する", "一時停止後進行"],
    correctIndex: 1,
    explanation: "赤信号では必ず停止します。"
  },
  {
    id: 3,
    question: "黄色信号の意味はどれですか？",
    choices: ["必ず止まる", "注意して進む", "進んではいけない", "徐行のみ"],
    correctIndex: 1,
    explanation: "黄色信号は注意して進む、または停止の準備です。"
  },
  {
    id: 4,
    question: "横断歩道に歩行者がいるときの正しい行動は？",
    choices: ["止まらず進む", "クラクションを鳴らす", "一時停止して譲る", "歩行者が避ける"],
    correctIndex: 2,
    explanation: "横断歩道では歩行者が最優先です。"
  },
  {
    id: 5,
    question: "踏切を通過するときに必要な行動は？",
    choices: ["減速のみ", "一時停止して確認", "クラクションを鳴らす", "加速する"],
    correctIndex: 1,
    explanation: "踏切では必ず一時停止し安全確認をします。"
  },
  {
    id: 6,
    question: "制限速度を超えてよい場合は？",
    choices: ["急いでいるとき", "後続車にあおられたとき", "どんな場合もだめ", "夜間のみ"],
    correctIndex: 2,
    explanation: "制限速度は必ず守らなければなりません。"
  },
  {
    id: 7,
    question: "一時停止標識がある場所で正しい行動は？",
    choices: ["減速のみ", "完全に止まる", "クラクションを鳴らす", "歩行者優先だけ守る"],
    correctIndex: 1,
    explanation: "一時停止では必ず完全に停止します。"
  },
  {
    id: 8,
    question: "交差点で右折するときの正しい方法は？",
    choices: ["すぐ右折", "直進車を優先", "歩行者を無視", "加速して曲がる"],
    correctIndex: 1,
    explanation: "右折時は直進車と歩行者を優先します。"
  },
  {
    id: 9,
    question: "雨の日に特に注意すべきことは？",
    choices: ["スピードを上げる", "車間距離を短くする", "スリップに注意", "特に変わらない"],
    correctIndex: 2,
    explanation: "雨の日はスリップしやすいため注意が必要です。"
  },
  {
    id: 10,
    question: "夜間走行で使うライトは？",
    choices: ["使わない", "スモールライト", "前照灯", "ハザード"],
    correctIndex: 2,
    explanation: "夜間は前照灯を必ず使用します。"
  },
  {
    id: 11,
    question: "シートベルトの着用が必要なのは？",
    choices: ["運転席のみ", "前席のみ", "後部座席は不要", "全ての座席"],
    correctIndex: 3,
    explanation: "全ての座席でシートベルト着用が必要です。"
  },
  {
    id: 12,
    question: "飲酒運転はどうなりますか？",
    choices: ["少しならOK", "夜だけOK", "厳しく禁止", "初心者のみ禁止"],
    correctIndex: 2,
    explanation: "飲酒運転は厳しく禁止されています。"
  },
  {
    id: 13,
    question: "携帯電話を使用しながら運転してよいですか？",
    choices: ["よい", "短時間ならよい", "だめ", "信号待ちならよい"],
    correctIndex: 2,
    explanation: "運転中の携帯電話使用は禁止です。"
  },
  {
    id: 14,
    question: "歩行者用信号が青のとき車は？",
    choices: ["進んでよい", "必ず止まる", "注意して進む", "クラクションを鳴らす"],
    correctIndex: 1,
    explanation: "歩行者信号が青のときは車は停止します。"
  },
  {
    id: 15,
    question: "交差点内で停止してはいけない理由は？",
    choices: ["かっこ悪い", "邪魔になる", "交通の妨げ", "罰金がない"],
    correctIndex: 2,
    explanation: "交差点内停止は交通の妨げになります。"
  },
  {
    id: 16,
    question: "クラクションを使ってよいのは？",
    choices: ["いつでも", "危険を知らせるとき", "あいさつ", "怒ったとき"],
    correctIndex: 1,
    explanation: "危険を知らせるために使用します。"
  },
  {
    id: 17,
    question: "緊急車両が来たときの対応は？",
    choices: ["無視する", "スピードを上げる", "道を譲る", "止まらない"],
    correctIndex: 2,
    explanation: "緊急車両には進路を譲ります。"
  },
  {
    id: 18,
    question: "駐車禁止場所に駐車すると？",
    choices: ["問題ない", "注意のみ", "罰則がある", "夜ならOK"],
    correctIndex: 2,
    explanation: "駐車禁止違反は罰則があります。"
  },
  {
    id: 19,
    question: "信号のない交差点で優先されるのは？",
    choices: ["速い車", "大きい車", "左から来る車", "道幅が広い方"],
    correctIndex: 3,
    explanation: "原則として道幅が広い道路が優先です。"
  },
  {
    id: 20,
    question: "見通しの悪い交差点では？",
    choices: ["加速する", "一時停止または徐行", "止まらない", "クラクションのみ"],
    correctIndex: 1,
    explanation: "見通しが悪い場合は一時停止や徐行が必要です。"
  },
  {
    id: 21,
    question: "高速道路での最低速度は？",
    choices: ["決まりはない", "標識で定められている", "30km/h", "50km/h"],
    correctIndex: 1,
    explanation: "最低速度は標識で定められています。"
  },
  {
    id: 22,
    question: "高速道路でのUターンは？",
    choices: ["可能", "条件付きで可能", "禁止", "夜のみ禁止"],
    correctIndex: 2,
    explanation: "高速道路でのUターンは禁止です。"
  },
  {
    id: 23,
    question: "車間距離を十分に取る理由は？",
    choices: ["燃費向上", "安全確保", "渋滞回避", "スピード維持"],
    correctIndex: 1,
    explanation: "追突事故を防ぐためです。"
  },
  {
    id: 24,
    question: "霧が濃いときは？",
    choices: ["ハイビーム", "スピードアップ", "徐行とライト点灯", "走らない"],
    correctIndex: 2,
    explanation: "視界が悪いため徐行とライト点灯が必要です。"
  },
  {
    id: 25,
    question: "子どもが近くにいる道路では？",
    choices: ["通常運転", "注意して徐行", "クラクション", "無視"],
    correctIndex: 1,
    explanation: "子どもは予測できない動きをするため注意が必要です。"
  },
  {
    id: 26,
    question: "右側駐車は？",
    choices: ["可能", "条件付き", "禁止", "夜のみ可能"],
    correctIndex: 2,
    explanation: "原則として右側駐車は禁止です。"
  },
  {
    id: 27,
    question: "方向指示器はいつ出す？",
    choices: ["曲がる直前", "約30m手前", "曲がりながら", "不要"],
    correctIndex: 1,
    explanation: "約30m手前で出します。"
  },
  {
    id: 28,
    question: "運転中眠くなったら？",
    choices: ["続ける", "音楽を上げる", "休憩する", "スピードを上げる"],
    correctIndex: 2,
    explanation: "安全のため休憩を取ります。"
  },
  {
    id: 29,
    question: "エンジンをかけたまま離れることは？",
    choices: ["よい", "短時間ならよい", "だめ", "夜のみだめ"],
    correctIndex: 2,
    explanation: "事故防止のため禁止です。"
  },
  {
    id: 30,
    question: "交差点での追い越しは？",
    choices: ["可能", "条件付き", "禁止", "夜のみ禁止"],
    correctIndex: 2,
    explanation: "交差点内の追い越しは禁止です。"
  },
  {
    id: 31,
    question: "歩道を走行してよいのは？",
    choices: ["いつでも", "混雑時", "原則だめ", "夜のみ"],
    correctIndex: 2,
    explanation: "歩道走行は原則禁止です。"
  },
  {
    id: 32,
    question: "信号のない横断歩道では？",
    choices: ["歩行者優先", "車優先", "同時", "速い方"],
    correctIndex: 0,
    explanation: "信号がなくても歩行者優先です。"
  },
  {
    id: 33,
    question: "雨天時の制動距離は？",
    choices: ["短くなる", "変わらない", "長くなる", "関係ない"],
    correctIndex: 2,
    explanation: "路面が滑りやすくなるため長くなります。"
  },
  {
    id: 34,
    question: "踏切内でエンストしたら？",
    choices: ["放置", "押して出る", "電車を待つ", "車内にいる"],
    correctIndex: 1,
    explanation: "すぐに車を押して脱出します。"
  },
  {
    id: 35,
    question: "交差点での左折時に注意するのは？",
    choices: ["右の車", "左の歩行者", "後続車", "信号のみ"],
    correctIndex: 1,
    explanation: "歩行者・自転車に注意します。"
  },
  {
    id: 36,
    question: "自転車はどこを通行しますか？",
    choices: ["歩道", "車道の左側", "車道の右側", "どこでも"],
    correctIndex: 1,
    explanation: "自転車は原則車道の左側を通行します。"
  },
  {
    id: 37,
    question: "安全確認の基本は？",
    choices: ["ミラーのみ", "目視のみ", "ミラーと目視", "感覚"],
    correctIndex: 2,
    explanation: "ミラーと目視の両方が必要です。"
  },
  {
    id: 38,
    question: "見通しの悪いカーブでは？",
    choices: ["加速", "徐行", "追い越し", "停止"],
    correctIndex: 1,
    explanation: "見通しが悪い場合は徐行します。"
  },
  {
    id: 39,
    question: "高速道路での停止は？",
    choices: ["可能", "原則禁止", "夜のみ可能", "自由"],
    correctIndex: 1,
    explanation: "高速道路での停止は原則禁止です。"
  },
  {
    id: 40,
    question: "ハザードランプを使う場面は？",
    choices: ["駐車中", "危険を知らせるとき", "夜間走行", "右折時"],
    correctIndex: 1,
    explanation: "後続車などに危険を知らせるために使用します。"
  },
  {
    id: 41,
    question: "タイヤの溝が少ないと？",
    choices: ["問題ない", "スリップしやすい", "燃費向上", "静か"],
    correctIndex: 1,
    explanation: "溝が少ないと雨天時に危険です。"
  },
  {
    id: 42,
    question: "追い越し禁止場所で追い越すと？",
    choices: ["問題ない", "注意", "違反", "夜ならOK"],
    correctIndex: 2,
    explanation: "追い越し禁止場所での追い越しは違反です。"
  },
  {
    id: 43,
    question: "運転前に確認すべきことは？",
    choices: ["燃料", "体調", "車の状態", "すべて"],
    correctIndex: 3,
    explanation: "安全運転のため全て確認します。"
  },
  {
    id: 44,
    question: "運転中に体調が悪くなったら？",
    choices: ["続ける", "休憩する", "急ぐ", "無視"],
    correctIndex: 1,
    explanation: "無理せず安全な場所で休憩します。"
  },
  {
    id: 45,
    question: "事故を起こしたとき最初にすることは？",
    choices: ["立ち去る", "警察へ連絡", "修理", "写真"],
    correctIndex: 1,
    explanation: "警察へ連絡し指示を受けます。"
  },
  {
    id: 46,
    question: "夜間に黒い服の歩行者が見えにくい理由は？",
    choices: ["反射しない", "スピードが速い", "歩かない", "信号がある"],
    correctIndex: 0,
    explanation: "光を反射しにくいため見えにくいです。"
  },
  {
    id: 47,
    question: "交差点での合図はいつ出す？",
    choices: ["直前", "早めに", "不要", "曲がってから"],
    correctIndex: 1,
    explanation: "周囲に知らせるため早めに出します。"
  },
  {
    id: 48,
    question: "雨の日にマンホールが滑りやすい理由は？",
    choices: ["金属だから", "水があるから", "丸いから", "色が違うから"],
    correctIndex: 0,
    explanation: "金属製で滑りやすくなります。"
  },
  {
    id: 49,
    question: "急ブレーキが危険な理由は？",
    choices: ["エンジン故障", "後続車追突", "燃費悪化", "騒音"],
    correctIndex: 1,
    explanation: "後続車に追突される危険があります。"
  },
  {
    id: 50,
    question: "安全運転で最も大切なことは？",
    choices: ["スピード", "経験", "思いやり", "技術"],
    correctIndex: 2,
    explanation: "他者を思いやる気持ちが安全運転につながります。"
  }
]
}