import type { Question } from "../types"

export const japaneseN4: Question[] = [
  // ===== 文法問題（1〜40） =====
  {
    id: 1,
    question: "わたしは まいにち がっこうへ（　）います。",
    choices: ["いき", "いく", "いって", "いきます"],
    correctIndex: 3,
    explanation: "「まいにち〜ます」の文なので「いきます」が正しいです。"
  },
  {
    id: 2,
    question: "きのう ともだちと えいがを（　）。",
    choices: ["みます", "みました", "みる", "みています"],
    correctIndex: 1,
    explanation: "「きのう」は過去なので「みました」を使います。"
  },
  {
    id: 3,
    question: "あめが（　）、かさを もって いきます。",
    choices: ["ふると", "ふるから", "ふって", "ふり"],
    correctIndex: 1,
    explanation: "理由を表すときは「〜から」を使います。"
  },
  {
    id: 4,
    question: "ここで たばこを（　）ください。",
    choices: ["すわないで", "すわなくて", "すわない", "すわな"],
    correctIndex: 0,
    explanation: "禁止は「〜ないでください」です。"
  },
  {
    id: 5,
    question: "にほんごは（　）ですが、たのしいです。",
    choices: ["むずかしい", "むずかしく", "むずかし", "むずかしかった"],
    correctIndex: 0,
    explanation: "「〜ですが」の前は普通形です。"
  },
  {
    id: 6,
    question: "えきまで あるいて（　）かかります。",
    choices: ["5ふん", "5ふんを", "5ふんに", "5ふんで"],
    correctIndex: 3,
    explanation: "時間がかかるときは「〜で」を使います。"
  },
  {
    id: 7,
    question: "これは わたし（　）かばんです。",
    choices: ["に", "の", "を", "が"],
    correctIndex: 1,
    explanation: "所有は「の」を使います。"
  },
  {
    id: 8,
    question: "あした あめが（　）と いいですね。",
    choices: ["ふらない", "ふらなく", "ふらなくて", "ふらなかった"],
    correctIndex: 0,
    explanation: "希望は「〜ないといいです」です。"
  },
  {
    id: 9,
    question: "この りょうりは あまり（　）です。",
    choices: ["おいしい", "おいしく", "おいしくない", "おいしかった"],
    correctIndex: 2,
    explanation: "「あまり〜ない」で否定を表します。"
  },
  {
    id: 10,
    question: "にほんでは くつを（　）から へやに はいります。",
    choices: ["ぬいで", "ぬぐ", "ぬぎ", "ぬい"],
    correctIndex: 0,
    explanation: "動作の順番は「〜て形」を使います。"
  },

  {
    id: 11,
    question: "この もんだいは だれ（　）できます。",
    choices: ["も", "が", "を", "に"],
    correctIndex: 0,
    explanation: "「だれも＋肯定」で全員を表します。"
  },
  {
    id: 12,
    question: "ねつが ある（　）、きょうは やすみます。",
    choices: ["から", "ので", "けど", "のに"],
    correctIndex: 0,
    explanation: "直接的な理由なので「から」が自然です。"
  },
  {
    id: 13,
    question: "しゅくだいは もう（　）います。",
    choices: ["やる", "やった", "やって", "やってい"],
    correctIndex: 2,
    explanation: "完了は「〜ている」で表します。"
  },
  {
    id: 14,
    question: "この えきは にぎやか（　）ないです。",
    choices: ["で", "に", "な", "の"],
    correctIndex: 0,
    explanation: "な形容詞の否定は「〜ではない」です。"
  },
  {
    id: 15,
    question: "わたしは コーヒー（　）より おちゃが すきです。",
    choices: ["が", "を", "に", "より"],
    correctIndex: 3,
    explanation: "比較には「〜より」を使います。"
  },
  {
    id: 16,
    question: "ドアを（　）まま でかけました。",
    choices: ["あける", "あけた", "あけて", "あけ"],
    correctIndex: 1,
    explanation: "「た形＋まま」で状態を表します。"
  },
  {
    id: 17,
    question: "ここに くる まえに でんわを（　）ください。",
    choices: ["かけ", "かけて", "かけた", "かける"],
    correctIndex: 1,
    explanation: "依頼は「〜てください」です。"
  },
  {
    id: 18,
    question: "にほんごが すこし（　）なりました。",
    choices: ["はなす", "はなして", "はなせる", "はなした"],
    correctIndex: 2,
    explanation: "能力は可能形で表します。"
  },
  {
    id: 19,
    question: "この バスは えき（　）とおります。",
    choices: ["で", "を", "に", "から"],
    correctIndex: 2,
    explanation: "到着点は「に」を使います。"
  },
  {
    id: 20,
    question: "あぶないですから、さわら（　）でください。",
    choices: ["ない", "なく", "な", "ぬ"],
    correctIndex: 0,
    explanation: "禁止は「〜ないでください」です。"
  },

  {
    id: 21,
    question: "あさ ごはんを（　）あとで しごとに いきます。",
    choices: ["たべる", "たべて", "たべた", "たべ"],
    correctIndex: 2,
    explanation: "「た形＋あとで」を使います。"
  },
  {
    id: 22,
    question: "この へやは ひろ（　）です。",
    choices: ["く", "い", "くて", "かった"],
    correctIndex: 0,
    explanation: "い形容詞は「ひろくです」となります。"
  },
  {
    id: 23,
    question: "にほんでは くるまが ひだりがわを（　）。",
    choices: ["はしる", "はしって", "はしります", "はしった"],
    correctIndex: 2,
    explanation: "一般的な事実は「〜ます形」です。"
  },
  {
    id: 24,
    question: "この かさは かるい（　）、べんりです。",
    choices: ["から", "ので", "けど", "のに"],
    correctIndex: 0,
    explanation: "理由を表すときは「から」を使います。"
  },
  {
    id: 25,
    question: "ここに すわっても（　）ですか。",
    choices: ["いい", "よい", "だめ", "いけない"],
    correctIndex: 0,
    explanation: "許可は「〜てもいいですか」です。"
  },
  {
    id: 26,
    question: "きょうは いそがしい（　）、あした にします。",
    choices: ["から", "ので", "けど", "のに"],
    correctIndex: 0,
    explanation: "理由なので「から」が自然です。"
  },
  {
    id: 27,
    question: "あめが ふって（　）、いきません。",
    choices: ["も", "は", "を", "に"],
    correctIndex: 0,
    explanation: "「〜ても」で逆接を表します。"
  },
  {
    id: 28,
    question: "この ほんは よみ（　）です。",
    choices: ["やすい", "にくい", "たい", "すぎ"],
    correctIndex: 0,
    explanation: "「〜やすい」は簡単な意味です。"
  },
  {
    id: 29,
    question: "にほんに きて 3ねん（　）なります。",
    choices: ["も", "が", "を", "で"],
    correctIndex: 0,
    explanation: "期間の強調には「も」を使います。"
  },
  {
    id: 30,
    question: "わたしは えいごが はなせ（　）。",
    choices: ["ます", "る", "て", "た"],
    correctIndex: 1,
    explanation: "可能形の普通形は「る」です。"
  },

  {
    id: 31,
    question: "でんしゃが こなくて こまっ（　）います。",
    choices: ["て", "た", "で", "と"],
    correctIndex: 1,
    explanation: "困った状態なので「困っています」となります。"
  },
  {
    id: 32,
    question: "この みちは くるまが おおく（　）。",
    choices: ["て", "で", "に", "を"],
    correctIndex: 1,
    explanation: "理由・状況を表す「〜で」です。"
  },
  {
    id: 33,
    question: "つぎの えきで おり（　）ください。",
    choices: ["て", "る", "ます", "た"],
    correctIndex: 0,
    explanation: "依頼は「〜てください」です。"
  },
  {
    id: 34,
    question: "この しごとは かんたん（　）ないです。",
    choices: ["で", "に", "な", "の"],
    correctIndex: 0,
    explanation: "な形容詞の否定は「〜ではない」です。"
  },
  {
    id: 35,
    question: "わたしは にく（　）たべません。",
    choices: ["を", "が", "は", "も"],
    correctIndex: 2,
    explanation: "否定のときは「は」を使います。"
  },
  {
    id: 36,
    question: "あめが ふる（　）かもしれません。",
    choices: ["と", "から", "ので", "のに"],
    correctIndex: 0,
    explanation: "条件の「と」を使います。"
  },
  {
    id: 37,
    question: "この ケーキは あま（　）すぎます。",
    choices: ["く", "い", "くて", "かった"],
    correctIndex: 0,
    explanation: "い形容詞＋すぎるは「く＋すぎる」です。"
  },
  {
    id: 38,
    question: "あしたは いそがしい（　）、いけません。",
    choices: ["から", "ので", "けど", "のに"],
    correctIndex: 0,
    explanation: "理由を表す「から」です。"
  },
  {
    id: 39,
    question: "ここで しゃしんを とっ（　）は だめです。",
    choices: ["て", "た", "たり", "と"],
    correctIndex: 0,
    explanation: "禁止は「〜てはいけません」です。"
  },
  {
    id: 40,
    question: "この かんじは かき（　）です。",
    choices: ["やすい", "にくい", "たい", "そう"],
    correctIndex: 1,
    explanation: "「〜にくい」は難しい意味です。"
  },

  // ===== 読解問題（41〜50） =====
  {
    id: 41,
    question: "Aさんは まいあさ 6じに おきます。なぜですか？",
    choices: ["がっこうが ちかいから", "しごとが はやいから", "ねるのが はやいから", "あさごはんが すきだから"],
    correctIndex: 1,
    explanation: "仕事が早いためです。"
  },
  {
    id: 42,
    question: "Bさんは きのう びょういんに いきました。どうしてですか？",
    choices: ["ともだちに あうため", "かぜを ひいたから", "しごとだから", "ひまだから"],
    correctIndex: 1,
    explanation: "かぜをひいたからです。"
  },
  {
    id: 43,
    question: "この みせは いつ やすみですか？",
    choices: ["げつようび", "かようび", "すいようび", "もくようび"],
    correctIndex: 2,
    explanation: "水曜日が休みです。"
  },
  {
    id: 44,
    question: "Cさんは なにで かいしゃへ いきますか？",
    choices: ["くるま", "でんしゃ", "じてんしゃ", "あるいて"],
    correctIndex: 1,
    explanation: "電車で行きます。"
  },
  {
    id: 45,
    question: "この こうえんは だれの ためですか？",
    choices: ["こども", "おとな", "かぞく", "みんな"],
    correctIndex: 3,
    explanation: "みんなのためです。"
  },
  {
    id: 46,
    question: "Dさんは なにを かいましたか？",
    choices: ["くつ", "かばん", "ほん", "ふく"],
    correctIndex: 0,
    explanation: "くつを買いました。"
  },
  {
    id: 47,
    question: "この でんしゃは どこまで いきますか？",
    choices: ["とうきょう", "おおさか", "きょうと", "なごや"],
    correctIndex: 0,
    explanation: "東京まで行きます。"
  },
  {
    id: 48,
    question: "Eさんは きょう なにを しますか？",
    choices: ["しごと", "やすみ", "りょこう", "べんきょう"],
    correctIndex: 1,
    explanation: "今日は休みです。"
  },
  {
    id: 49,
    question: "この レストランは どんな みせですか？",
    choices: ["たかい", "やすい", "しずか", "にぎやか"],
    correctIndex: 3,
    explanation: "にぎやかな店です。"
  },
  {
    id: 50,
    question: "Fさんは なぜ いそいで いますか？",
    choices: ["でんしゃに のるため", "ねむいから", "ひまだから", "あめだから"],
    correctIndex: 0,
    explanation: "電車に乗るためです。"
  }
]
