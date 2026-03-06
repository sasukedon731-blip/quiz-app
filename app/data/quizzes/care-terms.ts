import type { Quiz } from "@/app/data/types"
export const careTermsQuiz: Quiz = {
  id: "care-terms",
  title: "介護用語（重要100）",
  description: "介護現場で必須の用語100を4択で覚える",
  questions: [
    {
      id: 1,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食事や着替えなど日常生活の基本動作`,
      choices: [
        "ADL（日常生活動作）",
        "排泄介助",
        "更衣",
        "QOL（生活の質）",
      ],
      correctIndex: 0,
      explanation: `正解は「ADL（日常生活動作）」です。
ADL（日常生活動作）：食事や着替えなど日常生活の基本動作`,
    },
    {
      id: 2,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】その人らしく満足して生活できているかの程度`,
      choices: [
        "見守り",
        "移動",
        "更衣",
        "QOL（生活の質）",
      ],
      correctIndex: 3,
      explanation: `正解は「QOL（生活の質）」です。
QOL（生活の質）：その人らしく満足して生活できているかの程度`,
    },
    {
      id: 3,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】ベッドから車椅子などへ移り替えること`,
      choices: [
        "入浴介助",
        "移乗",
        "清拭（せいしき）",
        "移動",
      ],
      correctIndex: 1,
      explanation: `正解は「移乗」です。
移乗：ベッドから車椅子などへ移り替えること`,
    },
    {
      id: 4,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】場所を移ること（歩行・車椅子など）`,
      choices: [
        "見守り",
        "立位",
        "清拭（せいしき）",
        "移動",
      ],
      correctIndex: 3,
      explanation: `正解は「移動」です。
移動：場所を移ること（歩行・車椅子など）`,
    },
    {
      id: 5,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】服を着替えること`,
      choices: [
        "更衣",
        "ADL（日常生活動作）",
        "口腔ケア",
        "立位",
      ],
      correctIndex: 0,
      explanation: `正解は「更衣」です。
更衣：服を着替えること`,
    },
    {
      id: 6,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】身だしなみを整えること（洗顔・整髪など）`,
      choices: [
        "移動",
        "整容",
        "体位変換",
        "入浴介助",
      ],
      correctIndex: 1,
      explanation: `正解は「整容」です。
整容：身だしなみを整えること（洗顔・整髪など）`,
    },
    {
      id: 7,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】口の中を清潔にするケア`,
      choices: [
        "口腔ケア",
        "自立",
        "排泄介助",
        "離床",
      ],
      correctIndex: 0,
      explanation: `正解は「口腔ケア」です。
口腔ケア：口の中を清潔にするケア`,
    },
    {
      id: 8,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】入浴を安全に行うための手助け`,
      choices: [
        "入浴介助",
        "移動",
        "端座位（たんざい）",
        "見守り",
      ],
      correctIndex: 0,
      explanation: `正解は「入浴介助」です。
入浴介助：入浴を安全に行うための手助け`,
    },
    {
      id: 9,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】体を拭いて清潔にするケア`,
      choices: [
        "口腔ケア",
        "清拭（せいしき）",
        "移乗",
        "離床",
      ],
      correctIndex: 1,
      explanation: `正解は「清拭（せいしき）」です。
清拭（せいしき）：体を拭いて清潔にするケア`,
    },
    {
      id: 10,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】トイレや排泄動作を手伝うこと`,
      choices: [
        "排泄介助",
        "入浴介助",
        "移乗",
        "おむつ交換",
      ],
      correctIndex: 0,
      explanation: `正解は「排泄介助」です。
排泄介助：トイレや排泄動作を手伝うこと`,
    },
    {
      id: 11,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】おむつを取り替えること`,
      choices: [
        "おむつ交換",
        "臥位（がい）",
        "離床",
        "整容",
      ],
      correctIndex: 0,
      explanation: `正解は「おむつ交換」です。
おむつ交換：おむつを取り替えること`,
    },
    {
      id: 12,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】寝た姿勢を定期的に変えること`,
      choices: [
        "整容",
        "体位変換",
        "清拭（せいしき）",
        "移乗",
      ],
      correctIndex: 1,
      explanation: `正解は「体位変換」です。
体位変換：寝た姿勢を定期的に変えること`,
    },
    {
      id: 13,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】ベッドから起き上がること`,
      choices: [
        "清拭（せいしき）",
        "離床",
        "端座位（たんざい）",
        "入浴介助",
      ],
      correctIndex: 1,
      explanation: `正解は「離床」です。
離床：ベッドから起き上がること`,
    },
    {
      id: 14,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】ベッドの端に座る姿勢`,
      choices: [
        "おむつ交換",
        "端座位（たんざい）",
        "QOL（生活の質）",
        "離床",
      ],
      correctIndex: 1,
      explanation: `正解は「端座位（たんざい）」です。
端座位（たんざい）：ベッドの端に座る姿勢`,
    },
    {
      id: 15,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】立っている姿勢`,
      choices: [
        "自立",
        "口腔ケア",
        "おむつ交換",
        "立位",
      ],
      correctIndex: 3,
      explanation: `正解は「立位」です。
立位：立っている姿勢`,
    },
    {
      id: 16,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】横になっている姿勢`,
      choices: [
        "更衣",
        "臥位（がい）",
        "自立",
        "清拭（せいしき）",
      ],
      correctIndex: 1,
      explanation: `正解は「臥位（がい）」です。
臥位（がい）：横になっている姿勢`,
    },
    {
      id: 17,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】動作をほぼ全部手伝うこと`,
      choices: [
        "端座位（たんざい）",
        "全介助",
        "自立",
        "離床",
      ],
      correctIndex: 1,
      explanation: `正解は「全介助」です。
全介助：動作をほぼ全部手伝うこと`,
    },
    {
      id: 18,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】一部だけ手伝い、できる部分は本人が行うこと`,
      choices: [
        "臥位（がい）",
        "移乗",
        "一部介助",
        "全介助",
      ],
      correctIndex: 2,
      explanation: `正解は「一部介助」です。
一部介助：一部だけ手伝い、できる部分は本人が行うこと`,
    },
    {
      id: 19,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】危険がないよう近くで様子を見て支援すること`,
      choices: [
        "整容",
        "移乗",
        "端座位（たんざい）",
        "見守り",
      ],
      correctIndex: 3,
      explanation: `正解は「見守り」です。
見守り：危険がないよう近くで様子を見て支援すること`,
    },
    {
      id: 20,
      sectionId: "adl",
      question: `次の説明に当てはまる用語はどれですか？

【説明】介助なしで自分でできる状態`,
      choices: [
        "自立",
        "清拭（せいしき）",
        "ADL（日常生活動作）",
        "全介助",
      ],
      correctIndex: 0,
      explanation: `正解は「自立」です。
自立：介助なしで自分でできる状態`,
    },
    {
      id: 21,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食べ物や飲み物を飲み込むこと`,
      choices: [
        "嚥下（えんげ）",
        "下膳（げぜん）",
        "ミキサー食",
        "自助具",
      ],
      correctIndex: 0,
      explanation: `正解は「嚥下（えんげ）」です。
嚥下（えんげ）：食べ物や飲み物を飲み込むこと`,
    },
    {
      id: 22,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食べ物をかむこと`,
      choices: [
        "水分摂取",
        "誤飲",
        "咀嚼（そしゃく）",
        "嚥下（えんげ）",
      ],
      correctIndex: 2,
      explanation: `正解は「咀嚼（そしゃく）」です。
咀嚼（そしゃく）：食べ物をかむこと`,
    },
    {
      id: 23,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食べ物等が気管に入ってしまうこと`,
      choices: [
        "咀嚼（そしゃく）",
        "とろみ",
        "誤嚥（ごえん）",
        "ミキサー食",
      ],
      correctIndex: 2,
      explanation: `正解は「誤嚥（ごえん）」です。
誤嚥（ごえん）：食べ物等が気管に入ってしまうこと`,
    },
    {
      id: 24,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食べ物以外を飲み込んでしまうこと`,
      choices: [
        "誤飲",
        "下膳（げぜん）",
        "自助具",
        "誤嚥（ごえん）",
      ],
      correctIndex: 0,
      explanation: `正解は「誤飲」です。
誤飲：食べ物以外を飲み込んでしまうこと`,
    },
    {
      id: 25,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食事動作を安全に行うための手助け`,
      choices: [
        "食事介助",
        "水分摂取",
        "嚥下（えんげ）",
        "咀嚼（そしゃく）",
      ],
      correctIndex: 0,
      explanation: `正解は「食事介助」です。
食事介助：食事動作を安全に行うための手助け`,
    },
    {
      id: 26,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食事を配ること`,
      choices: [
        "刻み食",
        "誤飲",
        "配膳",
        "嚥下（えんげ）",
      ],
      correctIndex: 2,
      explanation: `正解は「配膳」です。
配膳：食事を配ること`,
    },
    {
      id: 27,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食事を下げること`,
      choices: [
        "咀嚼（そしゃく）",
        "下膳（げぜん）",
        "誤嚥（ごえん）",
        "とろみ",
      ],
      correctIndex: 1,
      explanation: `正解は「下膳（げぜん）」です。
下膳（げぜん）：食事を下げること`,
    },
    {
      id: 28,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食べ残した食事`,
      choices: [
        "誤嚥（ごえん）",
        "食事介助",
        "とろみ",
        "残食",
      ],
      correctIndex: 3,
      explanation: `正解は「残食」です。
残食：食べ残した食事`,
    },
    {
      id: 29,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】水分をとること`,
      choices: [
        "ソフト食",
        "水分摂取",
        "食事介助",
        "下膳（げぜん）",
      ],
      correctIndex: 1,
      explanation: `正解は「水分摂取」です。
水分摂取：水分をとること`,
    },
    {
      id: 30,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】飲み物等を飲み込みやすくするための粘り`,
      choices: [
        "ソフト食",
        "とろみ",
        "誤飲",
        "咀嚼（そしゃく）",
      ],
      correctIndex: 1,
      explanation: `正解は「とろみ」です。
とろみ：飲み物等を飲み込みやすくするための粘り`,
    },
    {
      id: 31,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食べやすいよう細かく刻んだ食事`,
      choices: [
        "刻み食",
        "誤飲",
        "とろみ",
        "水分摂取",
      ],
      correctIndex: 0,
      explanation: `正解は「刻み食」です。
刻み食：食べやすいよう細かく刻んだ食事`,
    },
    {
      id: 32,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】ミキサーでなめらかにした食事`,
      choices: [
        "ミキサー食",
        "嚥下（えんげ）",
        "ソフト食",
        "刻み食",
      ],
      correctIndex: 0,
      explanation: `正解は「ミキサー食」です。
ミキサー食：ミキサーでなめらかにした食事`,
    },
    {
      id: 33,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】やわらかく形を保った食事`,
      choices: [
        "配膳",
        "水分摂取",
        "ソフト食",
        "咀嚼（そしゃく）",
      ],
      correctIndex: 2,
      explanation: `正解は「ソフト食」です。
ソフト食：やわらかく形を保った食事`,
    },
    {
      id: 34,
      sectionId: "meal",
      question: `次の説明に当てはまる用語はどれですか？

【説明】本人が自分でできるよう助ける道具`,
      choices: [
        "誤嚥（ごえん）",
        "水分摂取",
        "誤飲",
        "自助具",
      ],
      correctIndex: 3,
      explanation: `正解は「自助具」です。
自助具：本人が自分でできるよう助ける道具`,
    },
    {
      id: 35,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】体温・脈拍・呼吸・血圧など生命の基本指標`,
      choices: [
        "バイタルサイン",
        "呼吸",
        "体温",
        "発赤（ほっせき）",
      ],
      correctIndex: 0,
      explanation: `正解は「バイタルサイン」です。
バイタルサイン：体温・脈拍・呼吸・血圧など生命の基本指標`,
    },
    {
      id: 36,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】血液が血管を押す力`,
      choices: [
        "発赤（ほっせき）",
        "意識レベル",
        "麻痺（まひ）",
        "血圧",
      ],
      correctIndex: 3,
      explanation: `正解は「血圧」です。
血圧：血液が血管を押す力`,
    },
    {
      id: 37,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】体の温度`,
      choices: [
        "体温",
        "血圧",
        "羞恥心（しゅうちしん）",
        "麻痺（まひ）",
      ],
      correctIndex: 0,
      explanation: `正解は「体温」です。
体温：体の温度`,
    },
    {
      id: 38,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】心臓の拍動の回数`,
      choices: [
        "血圧",
        "脈拍",
        "麻痺（まひ）",
        "呼吸",
      ],
      correctIndex: 1,
      explanation: `正解は「脈拍」です。
脈拍：心臓の拍動の回数`,
    },
    {
      id: 39,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】息をすること`,
      choices: [
        "呼吸",
        "体温",
        "発赤（ほっせき）",
        "羞恥心（しゅうちしん）",
      ],
      correctIndex: 0,
      explanation: `正解は「呼吸」です。
呼吸：息をすること`,
    },
    {
      id: 40,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】血液中の酸素の割合（経皮的酸素飽和度）`,
      choices: [
        "褥瘡（じょくそう）",
        "浮腫（ふしゅ）",
        "SpO2",
        "血圧",
      ],
      correctIndex: 2,
      explanation: `正解は「SpO2」です。
SpO2：血液中の酸素の割合（経皮的酸素飽和度）`,
    },
    {
      id: 41,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】意識のはっきり具合（呼びかけへの反応など）`,
      choices: [
        "血圧",
        "体温",
        "脈拍",
        "意識レベル",
      ],
      correctIndex: 3,
      explanation: `正解は「意識レベル」です。
意識レベル：意識のはっきり具合（呼びかけへの反応など）`,
    },
    {
      id: 42,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】皮膚が赤くなること`,
      choices: [
        "バイタルサイン",
        "脈拍",
        "発赤（ほっせき）",
        "意識レベル",
      ],
      correctIndex: 2,
      explanation: `正解は「発赤（ほっせき）」です。
発赤（ほっせき）：皮膚が赤くなること`,
    },
    {
      id: 43,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】床ずれ。圧迫で皮膚が傷つくこと`,
      choices: [
        "意識レベル",
        "褥瘡（じょくそう）",
        "呼吸",
        "発赤（ほっせき）",
      ],
      correctIndex: 1,
      explanation: `正解は「褥瘡（じょくそう）」です。
褥瘡（じょくそう）：床ずれ。圧迫で皮膚が傷つくこと`,
    },
    {
      id: 44,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】むくみ`,
      choices: [
        "浮腫（ふしゅ）",
        "呼吸",
        "体温",
        "脈拍",
      ],
      correctIndex: 0,
      explanation: `正解は「浮腫（ふしゅ）」です。
浮腫（ふしゅ）：むくみ`,
    },
    {
      id: 45,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】関節が固くなり動かしにくい状態`,
      choices: [
        "拘縮（こうしゅく）",
        "SpO2",
        "バイタルサイン",
        "羞恥心（しゅうちしん）",
      ],
      correctIndex: 0,
      explanation: `正解は「拘縮（こうしゅく）」です。
拘縮（こうしゅく）：関節が固くなり動かしにくい状態`,
    },
    {
      id: 46,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】体の一部が動きにくい・感じにくい状態`,
      choices: [
        "羞恥心（しゅうちしん）",
        "麻痺（まひ）",
        "体温",
        "褥瘡（じょくそう）",
      ],
      correctIndex: 1,
      explanation: `正解は「麻痺（まひ）」です。
麻痺（まひ）：体の一部が動きにくい・感じにくい状態`,
    },
    {
      id: 47,
      sectionId: "vital",
      question: `次の説明に当てはまる用語はどれですか？

【説明】恥ずかしいと感じる気持ち`,
      choices: [
        "血圧",
        "羞恥心（しゅうちしん）",
        "浮腫（ふしゅ）",
        "体温",
      ],
      correctIndex: 1,
      explanation: `正解は「羞恥心（しゅうちしん）」です。
羞恥心（しゅうちしん）：恥ずかしいと感じる気持ち`,
    },
    {
      id: 48,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】記憶や判断力が低下し生活に支障が出る状態`,
      choices: [
        "徘徊（はいかい）",
        "認知症",
        "不穏（ふおん）",
        "物取られ妄想",
      ],
      correctIndex: 1,
      explanation: `正解は「認知症」です。
認知症：記憶や判断力が低下し生活に支障が出る状態`,
    },
    {
      id: 49,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】時間・場所・人がわからなくなること`,
      choices: [
        "見当識障害",
        "受容",
        "物取られ妄想",
        "異食",
      ],
      correctIndex: 0,
      explanation: `正解は「見当識障害」です。
見当識障害：時間・場所・人がわからなくなること`,
    },
    {
      id: 50,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】目的なく歩き回ること`,
      choices: [
        "不穏（ふおん）",
        "徘徊（はいかい）",
        "物取られ妄想",
        "帰宅願望",
      ],
      correctIndex: 1,
      explanation: `正解は「徘徊（はいかい）」です。
徘徊（はいかい）：目的なく歩き回ること`,
    },
    {
      id: 51,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】意識が混乱し注意が保てない一時的な状態`,
      choices: [
        "見当識障害",
        "せん妄",
        "異食",
        "傾聴（けいちょう）",
      ],
      correctIndex: 1,
      explanation: `正解は「せん妄」です。
せん妄：意識が混乱し注意が保てない一時的な状態`,
    },
    {
      id: 52,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】落ち着かずそわそわしている状態`,
      choices: [
        "不穏（ふおん）",
        "受容",
        "見当識障害",
        "せん妄",
      ],
      correctIndex: 0,
      explanation: `正解は「不穏（ふおん）」です。
不穏（ふおん）：落ち着かずそわそわしている状態`,
    },
    {
      id: 53,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】家に帰りたいと思い強く訴えること`,
      choices: [
        "帰宅願望",
        "せん妄",
        "見当識障害",
        "異食",
      ],
      correctIndex: 0,
      explanation: `正解は「帰宅願望」です。
帰宅願望：家に帰りたいと思い強く訴えること`,
    },
    {
      id: 54,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】食べ物でない物を口にすること`,
      choices: [
        "不穏（ふおん）",
        "受容",
        "異食",
        "認知症",
      ],
      correctIndex: 2,
      explanation: `正解は「異食」です。
異食：食べ物でない物を口にすること`,
    },
    {
      id: 55,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】物を盗まれたと思い込むこと`,
      choices: [
        "不穏（ふおん）",
        "物取られ妄想",
        "見当識障害",
        "徘徊（はいかい）",
      ],
      correctIndex: 1,
      explanation: `正解は「物取られ妄想」です。
物取られ妄想：物を盗まれたと思い込むこと`,
    },
    {
      id: 56,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】相手の話をよく聞くこと`,
      choices: [
        "傾聴（けいちょう）",
        "共感",
        "不穏（ふおん）",
        "せん妄",
      ],
      correctIndex: 0,
      explanation: `正解は「傾聴（けいちょう）」です。
傾聴（けいちょう）：相手の話をよく聞くこと`,
    },
    {
      id: 57,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】相手の気持ちや考えを受け止めること`,
      choices: [
        "不穏（ふおん）",
        "物取られ妄想",
        "受容",
        "傾聴（けいちょう）",
      ],
      correctIndex: 2,
      explanation: `正解は「受容」です。
受容：相手の気持ちや考えを受け止めること`,
    },
    {
      id: 58,
      sectionId: "dementia",
      question: `次の説明に当てはまる用語はどれですか？

【説明】相手の気持ちに寄り添い同じように感じること`,
      choices: [
        "共感",
        "認知症",
        "不穏（ふおん）",
        "傾聴（けいちょう）",
      ],
      correctIndex: 0,
      explanation: `正解は「共感」です。
共感：相手の気持ちに寄り添い同じように感じること`,
    },
    {
      id: 59,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】座って移動するためのいす`,
      choices: [
        "ストレッチャー",
        "リフト",
        "車椅子",
        "介護ベッド",
      ],
      correctIndex: 2,
      explanation: `正解は「車椅子」です。
車椅子：座って移動するためのいす`,
    },
    {
      id: 60,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】歩行を支える器具`,
      choices: [
        "尿取りパッド",
        "介護ベッド",
        "歩行器",
        "車椅子",
      ],
      correctIndex: 2,
      explanation: `正解は「歩行器」です。
歩行器：歩行を支える器具`,
    },
    {
      id: 61,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】歩行を補助する棒`,
      choices: [
        "杖",
        "リフト",
        "介護ベッド",
        "車椅子",
      ],
      correctIndex: 0,
      explanation: `正解は「杖」です。
杖：歩行を補助する棒`,
    },
    {
      id: 62,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】背上げ等ができる介護用ベッド`,
      choices: [
        "介護ベッド",
        "尿取りパッド",
        "手すり",
        "ポータブルトイレ",
      ],
      correctIndex: 0,
      explanation: `正解は「介護ベッド」です。
介護ベッド：背上げ等ができる介護用ベッド`,
    },
    {
      id: 63,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】つかまって体を支える棒`,
      choices: [
        "介護ベッド",
        "手すり",
        "自助具",
        "杖",
      ],
      correctIndex: 1,
      explanation: `正解は「手すり」です。
手すり：つかまって体を支える棒`,
    },
    {
      id: 64,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】職員を呼ぶ呼び出しボタン`,
      choices: [
        "杖",
        "車椅子",
        "ポータブルトイレ",
        "ナースコール",
      ],
      correctIndex: 3,
      explanation: `正解は「ナースコール」です。
ナースコール：職員を呼ぶ呼び出しボタン`,
    },
    {
      id: 65,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】部屋で使える持ち運び式トイレ`,
      choices: [
        "歩行器",
        "杖",
        "手すり",
        "ポータブルトイレ",
      ],
      correctIndex: 3,
      explanation: `正解は「ポータブルトイレ」です。
ポータブルトイレ：部屋で使える持ち運び式トイレ`,
    },
    {
      id: 66,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】人の移動を機械で助ける装置`,
      choices: [
        "リフト",
        "介護ベッド",
        "自助具",
        "ストレッチャー",
      ],
      correctIndex: 0,
      explanation: `正解は「リフト」です。
リフト：人の移動を機械で助ける装置`,
    },
    {
      id: 67,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】寝たまま運ぶ搬送用ベッド`,
      choices: [
        "介護ベッド",
        "自助具",
        "車椅子",
        "ストレッチャー",
      ],
      correctIndex: 3,
      explanation: `正解は「ストレッチャー」です。
ストレッチャー：寝たまま運ぶ搬送用ベッド`,
    },
    {
      id: 68,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】尿を吸収するパッド`,
      choices: [
        "歩行器",
        "手すり",
        "ナースコール",
        "尿取りパッド",
      ],
      correctIndex: 3,
      explanation: `正解は「尿取りパッド」です。
尿取りパッド：尿を吸収するパッド`,
    },
    {
      id: 69,
      sectionId: "equipment",
      question: `次の説明に当てはまる用語はどれですか？

【説明】自分で食事や動作がしやすくなるよう助ける道具`,
      choices: [
        "車椅子",
        "自助具",
        "手すり",
        "歩行器",
      ],
      correctIndex: 1,
      explanation: `正解は「自助具」です。
自助具：自分で食事や動作がしやすくなるよう助ける道具`,
    },
    {
      id: 70,
      sectionId: "record",
      question: `次の説明に当てはまる用語はどれですか？

【説明】介護の状況や対応を記録すること`,
      choices: [
        "介護計画書（ケアプラン）",
        "モニタリング",
        "同意書",
        "ケース記録",
      ],
      correctIndex: 3,
      explanation: `正解は「ケース記録」です。
ケース記録：介護の状況や対応を記録すること`,
    },
    {
      id: 71,
      sectionId: "record",
      question: `次の説明に当てはまる用語はどれですか？

【説明】介護サービスの目標と内容の計画`,
      choices: [
        "担当者会議",
        "介護計画書（ケアプラン）",
        "モニタリング",
        "バイタル表",
      ],
      correctIndex: 1,
      explanation: `正解は「介護計画書（ケアプラン）」です。
介護計画書（ケアプラン）：介護サービスの目標と内容の計画`,
    },
    {
      id: 72,
      sectionId: "record",
      question: `次の説明に当てはまる用語はどれですか？

【説明】事故になりかけた事例の報告書`,
      choices: [
        "ケース記録",
        "ヒヤリハット報告書",
        "バイタル表",
        "申し送り",
      ],
      correctIndex: 1,
      explanation: `正解は「ヒヤリハット報告書」です。
ヒヤリハット報告書：事故になりかけた事例の報告書`,
    },
    {
      id: 73,
      sectionId: "record",
      question: `次の説明に当てはまる用語はどれですか？

【説明】次の担当へ情報を伝えること`,
      choices: [
        "ヒヤリハット報告書",
        "バイタル表",
        "申し送り",
        "ケース記録",
      ],
      correctIndex: 2,
      explanation: `正解は「申し送り」です。
申し送り：次の担当へ情報を伝えること`,
    },
    {
      id: 74,
      sectionId: "record",
      question: `次の説明に当てはまる用語はどれですか？

【説明】バイタルの記録表`,
      choices: [
        "担当者会議",
        "ケース記録",
        "バイタル表",
        "ヒヤリハット報告書",
      ],
      correctIndex: 2,
      explanation: `正解は「バイタル表」です。
バイタル表：バイタルの記録表`,
    },
    {
      id: 75,
      sectionId: "record",
      question: `次の説明に当てはまる用語はどれですか？

【説明】状態変化を観察・評価すること`,
      choices: [
        "同意書",
        "モニタリング",
        "ヒヤリハット報告書",
        "申し送り",
      ],
      correctIndex: 1,
      explanation: `正解は「モニタリング」です。
モニタリング：状態変化を観察・評価すること`,
    },
    {
      id: 76,
      sectionId: "record",
      question: `次の説明に当てはまる用語はどれですか？

【説明】関係者で支援方針を話し合う会議`,
      choices: [
        "担当者会議",
        "モニタリング",
        "申し送り",
        "介護計画書（ケアプラン）",
      ],
      correctIndex: 0,
      explanation: `正解は「担当者会議」です。
担当者会議：関係者で支援方針を話し合う会議`,
    },
    {
      id: 77,
      sectionId: "record",
      question: `次の説明に当てはまる用語はどれですか？

【説明】説明を受けて同意したことを示す書類`,
      choices: [
        "ヒヤリハット報告書",
        "担当者会議",
        "介護計画書（ケアプラン）",
        "同意書",
      ],
      correctIndex: 3,
      explanation: `正解は「同意書」です。
同意書：説明を受けて同意したことを示す書類`,
    },
    {
      id: 78,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】サービスを利用する人`,
      choices: [
        "老健",
        "利用者",
        "デイサービス",
        "グループホーム",
      ],
      correctIndex: 1,
      explanation: `正解は「利用者」です。
利用者：サービスを利用する人`,
    },
    {
      id: 79,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】施設に住んでいる人`,
      choices: [
        "ケアマネジャー",
        "入居者",
        "ヘルパー",
        "理学療法士（PT）",
      ],
      correctIndex: 1,
      explanation: `正解は「入居者」です。
入居者：施設に住んでいる人`,
    },
    {
      id: 80,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】ケアプランを作る介護支援専門員`,
      choices: [
        "ケアマネジャー",
        "デイサービス",
        "理学療法士（PT）",
        "看護師（ナース）",
      ],
      correctIndex: 0,
      explanation: `正解は「ケアマネジャー」です。
ケアマネジャー：ケアプランを作る介護支援専門員`,
    },
    {
      id: 81,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】介護を行う訪問介護員など`,
      choices: [
        "入居者",
        "看護師（ナース）",
        "老健",
        "ヘルパー",
      ],
      correctIndex: 3,
      explanation: `正解は「ヘルパー」です。
ヘルパー：介護を行う訪問介護員など`,
    },
    {
      id: 82,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】医療・看護を担当する職種`,
      choices: [
        "看護師（ナース）",
        "グループホーム",
        "特養",
        "老健",
      ],
      correctIndex: 0,
      explanation: `正解は「看護師（ナース）」です。
看護師（ナース）：医療・看護を担当する職種`,
    },
    {
      id: 83,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】身体機能の回復訓練を行う専門職`,
      choices: [
        "入居者",
        "理学療法士（PT）",
        "ヘルパー",
        "特養",
      ],
      correctIndex: 1,
      explanation: `正解は「理学療法士（PT）」です。
理学療法士（PT）：身体機能の回復訓練を行う専門職`,
    },
    {
      id: 84,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】生活動作の訓練を行う専門職`,
      choices: [
        "ヘルパー",
        "作業療法士（OT）",
        "デイサービス",
        "利用者",
      ],
      correctIndex: 1,
      explanation: `正解は「作業療法士（OT）」です。
作業療法士（OT）：生活動作の訓練を行う専門職`,
    },
    {
      id: 85,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】特別養護老人ホーム`,
      choices: [
        "老健",
        "デイサービス",
        "理学療法士（PT）",
        "特養",
      ],
      correctIndex: 3,
      explanation: `正解は「特養」です。
特養：特別養護老人ホーム`,
    },
    {
      id: 86,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】介護老人保健施設`,
      choices: [
        "デイサービス",
        "ケアマネジャー",
        "特養",
        "老健",
      ],
      correctIndex: 3,
      explanation: `正解は「老健」です。
老健：介護老人保健施設`,
    },
    {
      id: 87,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】日帰りで通う介護サービス`,
      choices: [
        "ヘルパー",
        "特養",
        "デイサービス",
        "看護師（ナース）",
      ],
      correctIndex: 2,
      explanation: `正解は「デイサービス」です。
デイサービス：日帰りで通う介護サービス`,
    },
    {
      id: 88,
      sectionId: "facility",
      question: `次の説明に当てはまる用語はどれですか？

【説明】認知症の人が少人数で暮らす施設`,
      choices: [
        "入居者",
        "グループホーム",
        "看護師（ナース）",
        "ヘルパー",
      ],
      correctIndex: 1,
      explanation: `正解は「グループホーム」です。
グループホーム：認知症の人が少人数で暮らす施設`,
    },
    {
      id: 89,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】立っている状態などで倒れること`,
      choices: [
        "窒息",
        "転倒",
        "虐待",
        "急変",
      ],
      correctIndex: 1,
      explanation: `正解は「転倒」です。
転倒：立っている状態などで倒れること`,
    },
    {
      id: 90,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】高い所から落ちること（ベッド・階段など）`,
      choices: [
        "窒息",
        "急変",
        "脱水",
        "転落",
      ],
      correctIndex: 3,
      explanation: `正解は「転落」です。
転落：高い所から落ちること（ベッド・階段など）`,
    },
    {
      id: 91,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】状態が急に悪くなること`,
      choices: [
        "隔離",
        "身体拘束",
        "急変",
        "虐待",
      ],
      correctIndex: 2,
      explanation: `正解は「急変」です。
急変：状態が急に悪くなること`,
    },
    {
      id: 92,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】息ができなくなること`,
      choices: [
        "転倒",
        "隔離",
        "誤薬",
        "窒息",
      ],
      correctIndex: 3,
      explanation: `正解は「窒息」です。
窒息：息ができなくなること`,
    },
    {
      id: 93,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】体の水分が不足すること`,
      choices: [
        "熱中症",
        "感染症",
        "隔離",
        "脱水",
      ],
      correctIndex: 3,
      explanation: `正解は「脱水」です。
脱水：体の水分が不足すること`,
    },
    {
      id: 94,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】暑さで体調が悪くなること`,
      choices: [
        "脱水",
        "身体拘束",
        "窒息",
        "熱中症",
      ],
      correctIndex: 3,
      explanation: `正解は「熱中症」です。
熱中症：暑さで体調が悪くなること`,
    },
    {
      id: 95,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】病原体で起こる病気`,
      choices: [
        "救急搬送",
        "隔離",
        "感染症",
        "熱中症",
      ],
      correctIndex: 2,
      explanation: `正解は「感染症」です。
感染症：病原体で起こる病気`,
    },
    {
      id: 96,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】感染を広げないよう分けて対応すること`,
      choices: [
        "虐待",
        "誤薬",
        "転倒",
        "隔離",
      ],
      correctIndex: 3,
      explanation: `正解は「隔離」です。
隔離：感染を広げないよう分けて対応すること`,
    },
    {
      id: 97,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】安全のため体の動きを制限すること`,
      choices: [
        "感染症",
        "急変",
        "転落",
        "身体拘束",
      ],
      correctIndex: 3,
      explanation: `正解は「身体拘束」です。
身体拘束：安全のため体の動きを制限すること`,
    },
    {
      id: 98,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】暴力や放置など不適切な扱い`,
      choices: [
        "脱水",
        "熱中症",
        "虐待",
        "感染症",
      ],
      correctIndex: 2,
      explanation: `正解は「虐待」です。
虐待：暴力や放置など不適切な扱い`,
    },
    {
      id: 99,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】薬を間違えて使うこと`,
      choices: [
        "脱水",
        "熱中症",
        "感染症",
        "誤薬",
      ],
      correctIndex: 3,
      explanation: `正解は「誤薬」です。
誤薬：薬を間違えて使うこと`,
    },
    {
      id: 100,
      sectionId: "risk",
      question: `次の説明に当てはまる用語はどれですか？

【説明】救急車などで医療機関へ運ぶこと`,
      choices: [
        "身体拘束",
        "救急搬送",
        "転倒",
        "隔離",
      ],
      correctIndex: 1,
      explanation: `正解は「救急搬送」です。
救急搬送：救急車などで医療機関へ運ぶこと`,
    },
  ],
}
