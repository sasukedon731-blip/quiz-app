export type Question = {
  id: number
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export const questions: Question[] = [
  {
    id: 1,
    question: "日本で自動車が左側通行なのはなぜですか？",
    choices: ["法律で偶然決まったから", "イギリスの影響", "戦後アメリカが決めたから", "道路が狭いから"],
    correctIndex: 1,
    explanation: "鉄道建設時にイギリスの方式を採用した影響で左側通行になりました。"
  },
  {
    id: 2,
    question: "赤信号でも進んでよいのはどんなときですか？",
    choices: ["急いでいるとき", "警察官の指示があるとき", "夜で車が少ないとき", "クラクションを鳴らしたとき"],
    correctIndex: 1,
    explanation: "信号よりも警察官の手信号や指示が優先されます。"
  },
  {
    id: 3,
    question: "横断歩道で正しい行動はどれですか？",
    choices: ["歩行者がいても進む", "クラクションを鳴らす", "歩行者がいれば停止する", "減速するだけでよい"],
    correctIndex: 2,
    explanation: "横断歩道では歩行者優先です。歩行者がいる場合は必ず停止します。"
  },
  {
    id: 4,
    question: "交差点で信号が青でも注意すべきことは？",
    choices: ["車が少なければ大丈夫", "歩行者が渡る場合は止まる", "バイクだけ優先", "標識は無視してよい"],
    correctIndex: 1,
    explanation: "青信号でも歩行者がいる場合は停止して安全を確保する必要があります。"
  },
  {
    id: 5,
    question: "飲酒運転の法定刑は？",
    choices: ["罰金のみ", "免停・罰金・懲役", "注意だけ", "免許取り消しなし"],
    correctIndex: 1,
    explanation: "飲酒運転は免停・罰金・懲役など厳しい刑罰があります。"
  },
  {
    id: 6,
    question: "シートベルトを着用しないとどうなる？",
    choices: ["罰金", "注意されるだけ", "免許停止", "何もない"],
    correctIndex: 0,
    explanation: "シートベルト未着用は道路交通法違反で罰金が科されます。"
  },
  {
    id: 7,
    question: "一時停止標識ではどうする？",
    choices: ["徐行すればよい", "完全に停止する", "止まらなくてもよい", "方向を変えるだけ"],
    correctIndex: 1,
    explanation: "一時停止標識では必ず一旦完全に停止し、安全確認します。"
  },
  {
    id: 8,
    question: "優先道路の標識はどれですか？",
    choices: ["赤い逆三角", "青い円", "黄と黒の線", "黄色の菱形"],
    correctIndex: 3,
    explanation: "黄色の菱形が優先道路を示す標識です。"
  },
  {
    id: 9,
    question: "右折時に注意することは？",
    choices: ["歩行者を確認", "信号無視して進む", "クラクション連打", "道路端に寄らない"],
    correctIndex: 0,
    explanation: "右折時は歩行者や自転車の横断を必ず確認する必要があります。"
  },
  {
    id: 10,
    question: "交差点での黄色信号の意味は？",
    choices: ["進め", "止まれ", "注意して進め", "速度を上げろ"],
    correctIndex: 2,
    explanation: "黄色信号は「進行注意」。止まれるなら止まる、進むなら安全確認。"
  },
  {
    id: 11,
    question: "夜間にライトを点灯するタイミングは？",
    choices: ["日没後すぐ", "暗くなったとき", "いつでも自由", "雨の日だけ"],
    correctIndex: 1,
    explanation: "夜間や暗くなった時点で必ずヘッドライトを点灯します。"
  },
  {
    id: 12,
    question: "高速道路で追越車線を走れる車は？",
    choices: ["すべての車", "追い越す車だけ", "バイクは不可", "軽自動車は不可"],
    correctIndex: 1,
    explanation: "追越車線は追い越す目的の車だけが走行できます。"
  },
  {
    id: 13,
    question: "雨の日にスリップを防ぐ運転方法は？",
    choices: ["速度を落とす", "ハンドルを強く切る", "ブレーキを踏まない", "急発進"],
    correctIndex: 0,
    explanation: "雨の日は滑りやすいので速度を落として慎重に運転します。"
  },
  {
    id: 14,
    question: "駐停車禁止の標識は？",
    choices: ["赤丸に青", "青丸に赤", "黄色の三角", "緑の四角"],
    correctIndex: 0,
    explanation: "赤丸に青の標識が駐停車禁止を示します。"
  },
  {
    id: 15,
    question: "子どもが歩く道路ではどう運転する？",
    choices: ["速度を落とす", "そのまま進む", "クラクション連打", "中央を走る"],
    correctIndex: 0,
    explanation: "子どもが歩く道路では必ず速度を落として安全を確保します。"
  },
  {
    id: 16,
    question: "左折時に注意することは？",
    choices: ["歩行者・自転車を確認", "右折車を無視", "信号無視して進む", "中央線を跨ぐ"],
    correctIndex: 0,
    explanation: "左折時も歩行者や自転車の横断を確認する必要があります。"
  },
  {
    id: 17,
    question: "赤信号で右折できる場合は？",
    choices: ["交差点に矢印信号があるとき", "いつでも右折可", "急いでいるとき", "車が少ないとき"],
    correctIndex: 0,
    explanation: "赤信号でも右折矢印信号が出ていれば進むことができます。"
  },
  {
    id: 18,
    question: "運転中にスマホを操作してはいけない理由は？",
    choices: ["危険だから", "法律で禁止されている", "集中力が低下する", "すべて正しい"],
    correctIndex: 3,
    explanation: "運転中のスマホ操作は危険であり法律違反で、集中力も低下します。"
  },
  {
    id: 19,
    question: "緊急車両が来た場合どうする？",
    choices: ["そのまま進む", "路肩に寄って停止", "速度を上げる", "クラクションを鳴らす"],
    correctIndex: 1,
    explanation: "緊急車両が来たら路肩に寄って停止し、進行を妨げないようにします。"
  },
  {
    id: 20,
    question: "タイヤの空気圧チェックはどれくらいの頻度ですか？",
    choices: ["月1回", "毎日", "半年に1回", "年1回"],
    correctIndex: 0,
    explanation: "タイヤの空気圧は少なくとも月1回はチェックすることが推奨されます。"
  },
  {
    id: 21,
    question: "高速道路の最低速度は？",
    choices: ["50km/h", "60km/h", "80km/h", "制限なし"],
    correctIndex: 1,
    explanation: "高速道路では最低速度が定められており、通常は60km/hです。"
  },
  {
    id: 22,
    question: "二輪車の追い越し方法は？",
    choices: ["左側から追い越す", "右側から追い越す", "交差点で追い越す", "いつでもOK"],
    correctIndex: 0,
    explanation: "二輪車は左側から追い越すのが原則です。"
  },
  {
    id: 23,
    question: "カーブで速度を落とさないとどうなる？",
    choices: ["スリップする", "そのまま安全", "ブレーキが効く", "加速できる"],
    correctIndex: 0,
    explanation: "カーブで速度を落とさないとスリップや車両の横転の危険があります。"
  },
  {
    id: 24,
    question: "夜間にライトを上向きにする理由は？",
    choices: ["遠くを照らすため", "対向車に迷惑をかけるため", "道路を暗くするため", "意味はない"],
    correctIndex: 0,
    explanation: "夜間は上向きライトで遠くを照らし、安全運転を確保します。"
  },
  {
    id: 25,
    question: "一時停止標識の後に安全確認は必要？",
    choices: ["必要ない", "必要", "徐行すればOK", "クラクションで確認"],
    correctIndex: 1,
    explanation: "一時停止後は必ず左右の安全を確認してから進行します。"
  },
  {
    id: 26,
    question: "トンネル内でヘッドライトを点灯する理由は？",
    choices: ["視認性向上", "法律違反防止", "他車へのアピール", "省エネ"],
    correctIndex: 0,
    explanation: "トンネル内では視認性を確保するために必ずヘッドライトを点灯します。"
  },
  {
    id: 27,
    question: "雨の日のワイパー使用は？",
    choices: ["必須", "任意", "点滅のみでOK", "使用禁止"],
    correctIndex: 0,
    explanation: "雨の日は必ずワイパーを使用して視界を確保します。"
  },
  {
    id: 28,
    question: "車線変更時に確認すべきものは？",
    choices: ["ミラー・死角・合図", "スピードのみ", "クラクションのみ", "前だけ見ればOK"],
    correctIndex: 0,
    explanation: "車線変更ではミラー確認・死角確認・合図が必須です。"
  },
  {
    id: 29,
    question: "歩行者優先の意味は？",
    choices: ["歩行者がいる場合車は停止", "歩行者は待つ必要あり", "車優先", "信号無視OK"],
    correctIndex: 0,
    explanation: "歩行者優先は車が必ず停止して安全を確保することを意味します。"
  },
  {
    id: 30,
    question: "信号の無い横断歩道で歩行者がいる場合は？",
    choices: ["止まる", "進む", "徐行のみ", "クラクションで進め"],
    correctIndex: 0,
    explanation: "信号のない横断歩道では歩行者がいる場合必ず停止します。"
  },
  {
    id: 31,
    question: "免許更新時に必要なことは？",
    choices: ["書類提出と講習受講", "筆記試験のみ", "視力検査のみ", "何も必要ない"],
    correctIndex: 0,
    explanation: "免許更新では書類提出と講習の受講が義務です。"
  },
  {
    id: 32,
    question: "スピード違反の罰則は？",
    choices: ["罰金・点数加算", "注意のみ", "免許停止なし", "何もなし"],
    correctIndex: 0,
    explanation: "スピード違反は罰金や違反点数の加算、場合によっては免許停止になります。"
  },
  {
    id: 33,
    question: "路面電車の横断時の注意は？",
    choices: ["止まる", "追い越す", "速度上げる", "クラクション"],
    correctIndex: 0,
    explanation: "路面電車横断時は安全確認のため必ず停止します。"
  },
  {
    id: 34,
    question: "駐車禁止場所で駐車すると？",
    choices: ["罰金・レッカー", "注意だけ", "OK", "免許停止なし"],
    correctIndex: 0,
    explanation: "駐車禁止場所での駐車は罰金やレッカーの対象になります。"
  },
  {
    id: 35,
    question: "交差点内で停止した場合は？",
    choices: ["違反", "OK", "徐行で可", "警察判断"],
    correctIndex: 0,
    explanation: "交差点内での停止は交通違反です。"
  },
  {
    id: 36,
    question: "夜間の歩行者反射材は必要な理由は？",
    choices: ["視認性向上", "おしゃれ", "意味なし", "任意"],
    correctIndex: 0,
    explanation: "夜間に歩行者の存在を運転者に知らせるため、反射材は重要です。"
  },
  {
    id: 37,
    question: "二段階右折が必要な車種は？",
    choices: ["自転車・原付", "普通車", "バイク全般", "トラック"],
    correctIndex: 0,
    explanation: "二段階右折は原付や小型自転車が対象です。"
  },
  {
    id: 38,
    question: "雨天時のブレーキ操作は？",
    choices: ["ゆっくり踏む", "強く踏む", "踏まない", "急発進"],
    correctIndex: 0,
    explanation: "雨天時はブレーキをゆっくり踏み、滑りを防ぎます。"
  },
  {
    id: 39,
    question: "横断歩道前の停止線は？",
    choices: ["必ず止まる位置", "無視可", "徐行だけ", "左右確認のみ"],
    correctIndex: 0,
    explanation: "停止線は横断歩道前で必ず停止すべき位置を示します。"
  },
  {
    id: 40,
    question: "運転中の飲酒が危険な理由は？",
    choices: ["判断力低下", "反応遅れる", "事故リスク増加", "すべて正しい"],
    correctIndex: 3,
    explanation: "飲酒運転は判断力低下・反応遅延・事故リスク増加のため危険です。"
  },
  {
    id: 41,
    question: "信号機が故障している場合は？",
    choices: ["一時停止して安全確認", "そのまま進む", "徐行のみ", "クラクションで進む"],
    correctIndex: 0,
    explanation: "信号機が故障している場合は、一旦停止して安全を確認して進みます。"
  },
  {
    id: 42,
    question: "追い越し禁止場所の標識は？",
    choices: ["赤丸に斜線", "青丸", "黄菱形", "緑四角"],
    correctIndex: 0,
    explanation: "赤丸に斜線の標識が追い越し禁止を示します。"
  },
  {
    id: 43,
    question: "駐車場で注意すべきことは？",
    choices: ["歩行者優先", "スピード無制限", "クラクションでアピール", "方向無視OK"],
    correctIndex: 0,
    explanation: "駐車場では歩行者が優先であり、安全確認が必要です。"
  },
  {
    id: 44,
    question: "交差点で警察官が手信号を出した場合は？",
    choices: ["信号より手信号優先", "信号無視OK", "手信号は無視可", "徐行だけ"],
    correctIndex: 0,
    explanation: "交差点では信号よりも警察官の手信号が優先です。"
  },
  {
    id: 45,
    question: "自転車に乗るときヘルメットは？",
    choices: ["着用推奨", "不要", "任意で不要", "必須ではない"],
    correctIndex: 0,
    explanation: "安全確保のため自転車乗車時はヘルメットの着用が推奨されます。"
  },
  {
    id: 46,
    question: "踏切で注意すべきことは？",
    choices: ["列車接近時は停止", "徐行のみ", "クラクション", "踏切無視可"],
    correctIndex: 0,
    explanation: "踏切では列車接近時に必ず停止して安全を確保します。"
  },
  {
    id: 47,
    question: "車間距離を保つ理由は？",
    choices: ["追突防止", "信号無視", "速度上げるため", "方向変更のため"],
    correctIndex: 0,
    explanation: "車間距離を保つことで追突事故の防止ができます。"
  },
  {
    id: 48,
    question: "道路標示の白線は？",
    choices: ["車線分離", "停止線なし", "進入禁止", "優先道路"],
    correctIndex: 0,
    explanation: "白線は車線を分けるために引かれています。"
  },
  {
    id: 49,
    question: "道路標示の黄色線は？",
    choices: ["追越禁止", "停止線なし", "車線分離", "信号指示"],
    correctIndex: 0,
    explanation: "黄色線は追越禁止や注意喚起の意味があります。"
  },
  {
    id: 50,
    question: "免許取得後最初の運転で注意すべきことは？",
    choices: ["速度控えめ・安全確認", "通常運転でOK", "急加速", "交差点無視"],
    correctIndex: 0,
    explanation: "免許取得後は特に速度を控えめにし、安全確認を怠らないことが重要です。"
  }
]
