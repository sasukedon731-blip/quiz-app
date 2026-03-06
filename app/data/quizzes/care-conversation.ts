import type { Quiz } from "@/app/data/types"

export const careConversationQuiz: Quiz = {
  id: "care-conversation",
  title: "介護現場会話（聴解）",
  questions: [
    {
      id: 1,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "車椅子に移ります。手伝ってください。",
      choices: [
        "ストレッチャーを用意する / prepare a stretcher",
        "ベッドの柵を上げる / raise the bed rails",
        "移乗を手伝う / assist transfer",
        "入浴介助をする / assist bathing",
      ],
      correctIndex: 2,
      explanation: `【音声】車椅子に移ります。手伝ってください。

指示（または状況）に合う対応は「移乗を手伝う」です。`,
    },
    {
      id: 2,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ベッドから起きます。起こしてください。",
      choices: [
        "口腔ケアをする / do oral care",
        "清拭をする / wipe the body",
        "更衣を手伝う / assist dressing",
        "離床を促す / encourage getting out of bed",
      ],
      correctIndex: 3,
      explanation: `【音声】ベッドから起きます。起こしてください。

指示（または状況）に合う対応は「離床を促す」です。`,
    },
    {
      id: 3,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "座ってください。ベッドの端に座ります。",
      choices: [
        "離床を促す / encourage getting out of bed",
        "ベッドの柵を上げる / raise the bed rails",
        "端座位にする / sit on the edge of bed",
        "体位変換をする / change position",
      ],
      correctIndex: 2,
      explanation: `【音声】座ってください。ベッドの端に座ります。

指示（または状況）に合う対応は「端座位にする」です。`,
    },
    {
      id: 4,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "立ってみましょう。支えてください。",
      choices: [
        "とろみを付ける / add thickener",
        "自助具を準備する / prepare assistive device",
        "移動を介助する / assist moving",
        "窒息に対応する / respond to choking",
      ],
      correctIndex: 2,
      explanation: `【音声】立ってみましょう。支えてください。

指示（または状況）に合う対応は「移動を介助する」です。`,
    },
    {
      id: 5,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "服を着替えます。手伝ってください。",
      choices: [
        "更衣を手伝う / assist dressing",
        "車椅子を準備する / prepare a wheelchair",
        "血圧を測る / measure blood pressure",
        "歩行器を使う / use a walker",
      ],
      correctIndex: 0,
      explanation: `【音声】服を着替えます。手伝ってください。

指示（または状況）に合う対応は「更衣を手伝う」です。`,
    },
    {
      id: 6,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "体の向きを変えてください。",
      choices: [
        "体温を測る / measure temperature",
        "体位変換をする / change position",
        "排泄介助をする / assist toileting",
        "ナースコールを確認する / check nurse call",
      ],
      correctIndex: 1,
      explanation: `【音声】体の向きを変えてください。

指示（または状況）に合う対応は「体位変換をする」です。`,
    },
    {
      id: 7,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "体を拭いてください。",
      choices: [
        "清拭をする / wipe the body",
        "離床を促す / encourage getting out of bed",
        "端座位にする / sit on the edge of bed",
        "ヒヤリハットを報告する / report a near-miss",
      ],
      correctIndex: 0,
      explanation: `【音声】体を拭いてください。

指示（または状況）に合う対応は「清拭をする」です。`,
    },
    {
      id: 8,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "お風呂に入りましょう。",
      choices: [
        "誤薬を防ぐ / prevent medication errors",
        "転倒を防ぐ / prevent falls",
        "体位変換をする / change position",
        "入浴介助をする / assist bathing",
      ],
      correctIndex: 3,
      explanation: `【音声】お風呂に入りましょう。

指示（または状況）に合う対応は「入浴介助をする」です。`,
    },
    {
      id: 9,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "トイレに行きたいです。",
      choices: [
        "自助具を準備する / prepare assistive device",
        "排泄介助をする / assist toileting",
        "ストレッチャーを用意する / prepare a stretcher",
        "SpO2を測る / measure oxygen saturation",
      ],
      correctIndex: 1,
      explanation: `【音声】トイレに行きたいです。

指示（または状況）に合う対応は「排泄介助をする」です。`,
    },
    {
      id: 10,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "おむつを替えてください。",
      choices: [
        "移動を介助する / assist moving",
        "おむつを交換する / change a diaper",
        "体位変換をする / change position",
        "窒息に対応する / respond to choking",
      ],
      correctIndex: 1,
      explanation: `【音声】おむつを替えてください。

指示（または状況）に合う対応は「おむつを交換する」です。`,
    },
    {
      id: 11,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "口の中をきれいにします。",
      choices: [
        "口腔ケアをする / do oral care",
        "ヒヤリハットを報告する / report a near-miss",
        "ミキサー食にする / provide pureed diet",
        "離床を促す / encourage getting out of bed",
      ],
      correctIndex: 0,
      explanation: `【音声】口の中をきれいにします。

指示（または状況）に合う対応は「口腔ケアをする」です。`,
    },
    {
      id: 12,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "車椅子を持ってきてください。",
      choices: [
        "車椅子を準備する / prepare a wheelchair",
        "記録を残す / write a record",
        "申し送りをする / handover information",
        "おむつを交換する / change a diaper",
      ],
      correctIndex: 0,
      explanation: `【音声】車椅子を持ってきてください。

指示（または状況）に合う対応は「車椅子を準備する」です。`,
    },
    {
      id: 13,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ベッドの柵を上げてください。",
      choices: [
        "急変に備える / prepare for sudden change",
        "褥瘡を確認する / check pressure sores",
        "浮腫を確認する / check swelling",
        "ベッドの柵を上げる / raise the bed rails",
      ],
      correctIndex: 3,
      explanation: `【音声】ベッドの柵を上げてください。

指示（または状況）に合う対応は「ベッドの柵を上げる」です。`,
    },
    {
      id: 14,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "歩行器を使います。準備してください。",
      choices: [
        "歩行器を使う / use a walker",
        "誤薬を防ぐ / prevent medication errors",
        "ミキサー食にする / provide pureed diet",
        "下膳する / clear dishes",
      ],
      correctIndex: 0,
      explanation: `【音声】歩行器を使います。準備してください。

指示（または状況）に合う対応は「歩行器を使う」です。`,
    },
    {
      id: 15,
      sectionId: "adl",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "杖を使って歩きます。",
      choices: [
        "杖を使う / use a cane",
        "急変に備える / prepare for sudden change",
        "ストレッチャーを用意する / prepare a stretcher",
        "血圧を測る / measure blood pressure",
      ],
      correctIndex: 0,
      explanation: `【音声】杖を使って歩きます。

指示（または状況）に合う対応は「杖を使う」です。`,
    },
    {
      id: 16,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "むせています。食べるのを止めてください。",
      choices: [
        "刻み食にする / provide minced diet",
        "移乗を手伝う / assist transfer",
        "トイレへ誘導する / guide to toilet",
        "窒息に対応する / respond to choking",
      ],
      correctIndex: 3,
      explanation: `【音声】むせています。食べるのを止めてください。

指示（または状況）に合う対応は「窒息に対応する」です。`,
    },
    {
      id: 17,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "飲み物にとろみを付けてください。",
      choices: [
        "刻み食にする / provide minced diet",
        "体温を測る / measure temperature",
        "とろみを付ける / add thickener",
        "移動を介助する / assist moving",
      ],
      correctIndex: 2,
      explanation: `【音声】飲み物にとろみを付けてください。

指示（または状況）に合う対応は「とろみを付ける」です。`,
    },
    {
      id: 18,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "刻み食にしてください。",
      choices: [
        "褥瘡を確認する / check pressure sores",
        "刻み食にする / provide minced diet",
        "転倒を防ぐ / prevent falls",
        "看護師に連絡する / contact a nurse",
      ],
      correctIndex: 1,
      explanation: `【音声】刻み食にしてください。

指示（または状況）に合う対応は「刻み食にする」です。`,
    },
    {
      id: 19,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ミキサー食にしてください。",
      choices: [
        "ミキサー食にする / provide pureed diet",
        "バイタルを測る / check vitals",
        "自助具を準備する / prepare assistive device",
        "更衣を手伝う / assist dressing",
      ],
      correctIndex: 0,
      explanation: `【音声】ミキサー食にしてください。

指示（または状況）に合う対応は「ミキサー食にする」です。`,
    },
    {
      id: 20,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "食事を手伝ってください。",
      choices: [
        "ヒヤリハットを報告する / report a near-miss",
        "記録を残す / write a record",
        "食事介助をする / assist eating",
        "杖を使う / use a cane",
      ],
      correctIndex: 2,
      explanation: `【音声】食事を手伝ってください。

指示（または状況）に合う対応は「食事介助をする」です。`,
    },
    {
      id: 21,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "お茶を飲みましょう。",
      choices: [
        "端座位にする / sit on the edge of bed",
        "整容を手伝う / assist grooming",
        "移乗を手伝う / assist transfer",
        "水分をすすめる / encourage hydration",
      ],
      correctIndex: 3,
      explanation: `【音声】お茶を飲みましょう。

指示（または状況）に合う対応は「水分をすすめる」です。`,
    },
    {
      id: 22,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ごはんを配ってください。",
      choices: [
        "ポータブルトイレを用意する / prepare portable toilet",
        "救急搬送を手配する / arrange emergency transport",
        "浮腫を確認する / check swelling",
        "配膳する / serve meals",
      ],
      correctIndex: 3,
      explanation: `【音声】ごはんを配ってください。

指示（または状況）に合う対応は「配膳する」です。`,
    },
    {
      id: 23,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "食べ終わりました。片付けてください。",
      choices: [
        "ポータブルトイレを用意する / prepare portable toilet",
        "下膳する / clear dishes",
        "配膳する / serve meals",
        "感染対策をする / take infection control",
      ],
      correctIndex: 1,
      explanation: `【音声】食べ終わりました。片付けてください。

指示（または状況）に合う対応は「下膳する」です。`,
    },
    {
      id: 24,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "残っている量を確認してください。",
      choices: [
        "残食を確認する / check leftovers",
        "浮腫を確認する / check swelling",
        "口腔ケアをする / do oral care",
        "誤薬を防ぐ / prevent medication errors",
      ],
      correctIndex: 0,
      explanation: `【音声】残っている量を確認してください。

指示（または状況）に合う対応は「残食を確認する」です。`,
    },
    {
      id: 25,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "スプーンが持ちにくいです。",
      choices: [
        "体温を測る / measure temperature",
        "自助具を準備する / prepare assistive device",
        "救急搬送を手配する / arrange emergency transport",
        "口腔ケアをする / do oral care",
      ],
      correctIndex: 1,
      explanation: `【音声】スプーンが持ちにくいです。

指示（または状況）に合う対応は「自助具を準備する」です。`,
    },
    {
      id: 26,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "飲み込めるか見てください。",
      choices: [
        "配膳する / serve meals",
        "様子を見守る / keep watching",
        "バイタルを測る / check vitals",
        "誤薬を防ぐ / prevent medication errors",
      ],
      correctIndex: 1,
      explanation: `【音声】飲み込めるか見てください。

指示（または状況）に合う対応は「様子を見守る」です。`,
    },
    {
      id: 27,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "のどにつまりそうです。",
      choices: [
        "SpO2を測る / measure oxygen saturation",
        "食事介助をする / assist eating",
        "窒息に対応する / respond to choking",
        "リフトを使う / use a lift",
      ],
      correctIndex: 2,
      explanation: `【音声】のどにつまりそうです。

指示（または状況）に合う対応は「窒息に対応する」です。`,
    },
    {
      id: 28,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "水分をとってください。",
      choices: [
        "残食を確認する / check leftovers",
        "整容を手伝う / assist grooming",
        "排泄介助をする / assist toileting",
        "水分をすすめる / encourage hydration",
      ],
      correctIndex: 3,
      explanation: `【音声】水分をとってください。

指示（または状況）に合う対応は「水分をすすめる」です。`,
    },
    {
      id: 29,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "食事の前に口をきれいにします。",
      choices: [
        "入浴介助をする / assist bathing",
        "口腔ケアをする / do oral care",
        "食事介助をする / assist eating",
        "ベッドの柵を上げる / raise the bed rails",
      ],
      correctIndex: 1,
      explanation: `【音声】食事の前に口をきれいにします。

指示（または状況）に合う対応は「口腔ケアをする」です。`,
    },
    {
      id: 30,
      sectionId: "meal",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "食事の後に口をきれいにします。",
      choices: [
        "バイタルを測る / check vitals",
        "移乗を手伝う / assist transfer",
        "歩行器を使う / use a walker",
        "口腔ケアをする / do oral care",
      ],
      correctIndex: 3,
      explanation: `【音声】食事の後に口をきれいにします。

指示（または状況）に合う対応は「口腔ケアをする」です。`,
    },
    {
      id: 31,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "血圧を測ります。腕を出してください。",
      choices: [
        "整容を手伝う / assist grooming",
        "残食を確認する / check leftovers",
        "血圧を測る / measure blood pressure",
        "移動を介助する / assist moving",
      ],
      correctIndex: 2,
      explanation: `【音声】血圧を測ります。腕を出してください。

指示（または状況）に合う対応は「血圧を測る」です。`,
    },
    {
      id: 32,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "体温を測ります。",
      choices: [
        "自助具を準備する / prepare assistive device",
        "排泄介助をする / assist toileting",
        "体温を測る / measure temperature",
        "バイタルを測る / check vitals",
      ],
      correctIndex: 2,
      explanation: `【音声】体温を測ります。

指示（または状況）に合う対応は「体温を測る」です。`,
    },
    {
      id: 33,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "息が苦しいです。酸素を測ってください。",
      choices: [
        "SpO2を測る / measure oxygen saturation",
        "看護師に連絡する / contact a nurse",
        "窒息に対応する / respond to choking",
        "様子を見守る / keep watching",
      ],
      correctIndex: 0,
      explanation: `【音声】息が苦しいです。酸素を測ってください。

指示（または状況）に合う対応は「SpO2を測る」です。`,
    },
    {
      id: 34,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "バイタルを測ってください。",
      choices: [
        "ミキサー食にする / provide pureed diet",
        "刻み食にする / provide minced diet",
        "口腔ケアをする / do oral care",
        "バイタルを測る / check vitals",
      ],
      correctIndex: 3,
      explanation: `【音声】バイタルを測ってください。

指示（または状況）に合う対応は「バイタルを測る」です。`,
    },
    {
      id: 35,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "赤くなっている所があります。見てください。",
      choices: [
        "刻み食にする / provide minced diet",
        "残食を確認する / check leftovers",
        "発赤を確認する / check redness",
        "歩行器を使う / use a walker",
      ],
      correctIndex: 2,
      explanation: `【音声】赤くなっている所があります。見てください。

指示（または状況）に合う対応は「発赤を確認する」です。`,
    },
    {
      id: 36,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "床ずれがないか確認してください。",
      choices: [
        "移乗を手伝う / assist transfer",
        "リフトを使う / use a lift",
        "褥瘡を確認する / check pressure sores",
        "窒息に対応する / respond to choking",
      ],
      correctIndex: 2,
      explanation: `【音声】床ずれがないか確認してください。

指示（または状況）に合う対応は「褥瘡を確認する」です。`,
    },
    {
      id: 37,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "足がむくんでいます。見てください。",
      choices: [
        "浮腫を確認する / check swelling",
        "移動を介助する / assist moving",
        "食事介助をする / assist eating",
        "声かけして安心させる / reassure with a voice",
      ],
      correctIndex: 0,
      explanation: `【音声】足がむくんでいます。見てください。

指示（または状況）に合う対応は「浮腫を確認する」です。`,
    },
    {
      id: 38,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "急に具合が悪くなりました。",
      choices: [
        "下膳する / clear dishes",
        "とろみを付ける / add thickener",
        "急変に備える / prepare for sudden change",
        "入浴介助をする / assist bathing",
      ],
      correctIndex: 2,
      explanation: `【音声】急に具合が悪くなりました。

指示（または状況）に合う対応は「急変に備える」です。`,
    },
    {
      id: 39,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "意識がはっきりしません。看護師を呼んでください。",
      choices: [
        "離床を促す / encourage getting out of bed",
        "救急搬送を手配する / arrange emergency transport",
        "水分をすすめる / encourage hydration",
        "看護師に連絡する / contact a nurse",
      ],
      correctIndex: 3,
      explanation: `【音声】意識がはっきりしません。看護師を呼んでください。

指示（または状況）に合う対応は「看護師に連絡する」です。`,
    },
    {
      id: 40,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "呼吸が変です。",
      choices: [
        "ナースコールを確認する / check nurse call",
        "看護師に連絡する / contact a nurse",
        "隔離する / isolate",
        "救急搬送を手配する / arrange emergency transport",
      ],
      correctIndex: 1,
      explanation: `【音声】呼吸が変です。

指示（または状況）に合う対応は「看護師に連絡する」です。`,
    },
    {
      id: 41,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "今日はバイタル表に書いてください。",
      choices: [
        "離床を促す / encourage getting out of bed",
        "褥瘡を確認する / check pressure sores",
        "浮腫を確認する / check swelling",
        "記録を残す / write a record",
      ],
      correctIndex: 3,
      explanation: `【音声】今日はバイタル表に書いてください。

指示（または状況）に合う対応は「記録を残す」です。`,
    },
    {
      id: 42,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "転倒しないように見てください。",
      choices: [
        "転倒を防ぐ / prevent falls",
        "水分をすすめる / encourage hydration",
        "ミキサー食にする / provide pureed diet",
        "離床を促す / encourage getting out of bed",
      ],
      correctIndex: 0,
      explanation: `【音声】転倒しないように見てください。

指示（または状況）に合う対応は「転倒を防ぐ」です。`,
    },
    {
      id: 43,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "脱水にならないようにしてください。",
      choices: [
        "おむつを交換する / change a diaper",
        "水分をすすめる / encourage hydration",
        "入浴介助をする / assist bathing",
        "隔離する / isolate",
      ],
      correctIndex: 1,
      explanation: `【音声】脱水にならないようにしてください。

指示（または状況）に合う対応は「水分をすすめる」です。`,
    },
    {
      id: 44,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "熱中症に注意してください。",
      choices: [
        "移動を介助する / assist moving",
        "感染対策をする / take infection control",
        "自助具を準備する / prepare assistive device",
        "水分をすすめる / encourage hydration",
      ],
      correctIndex: 3,
      explanation: `【音声】熱中症に注意してください。

指示（または状況）に合う対応は「水分をすすめる」です。`,
    },
    {
      id: 45,
      sectionId: "vital",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "感染症の可能性があります。",
      choices: [
        "感染対策をする / take infection control",
        "整容を手伝う / assist grooming",
        "ミキサー食にする / provide pureed diet",
        "端座位にする / sit on the edge of bed",
      ],
      correctIndex: 0,
      explanation: `【音声】感染症の可能性があります。

指示（または状況）に合う対応は「感染対策をする」です。`,
    },
    {
      id: 46,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "落ち着かないので、話を聞いてください。",
      choices: [
        "とろみを付ける / add thickener",
        "身体拘束をしない / avoid restraints",
        "看護師に連絡する / contact a nurse",
        "声かけして安心させる / reassure with a voice",
      ],
      correctIndex: 3,
      explanation: `【音声】落ち着かないので、話を聞いてください。

指示（または状況）に合う対応は「声かけして安心させる」です。`,
    },
    {
      id: 47,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "帰りたいと言っています。対応してください。",
      choices: [
        "声かけして安心させる / reassure with a voice",
        "ヒヤリハットを報告する / report a near-miss",
        "車椅子を準備する / prepare a wheelchair",
        "バイタルを測る / check vitals",
      ],
      correctIndex: 0,
      explanation: `【音声】帰りたいと言っています。対応してください。

指示（または状況）に合う対応は「声かけして安心させる」です。`,
    },
    {
      id: 48,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "夜に歩き回っています。",
      choices: [
        "急変に備える / prepare for sudden change",
        "誤薬を防ぐ / prevent medication errors",
        "様子を見守る / keep watching",
        "自助具を準備する / prepare assistive device",
      ],
      correctIndex: 2,
      explanation: `【音声】夜に歩き回っています。

指示（または状況）に合う対応は「様子を見守る」です。`,
    },
    {
      id: 49,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "物を食べようとしています。止めてください。",
      choices: [
        "移乗を手伝う / assist transfer",
        "体温を測る / measure temperature",
        "とろみを付ける / add thickener",
        "様子を見守る / keep watching",
      ],
      correctIndex: 3,
      explanation: `【音声】物を食べようとしています。止めてください。

指示（または状況）に合う対応は「様子を見守る」です。`,
    },
    {
      id: 50,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "不安そうなので、そばにいてください。",
      choices: [
        "身体拘束をしない / avoid restraints",
        "杖を使う / use a cane",
        "様子を見守る / keep watching",
        "移乗を手伝う / assist transfer",
      ],
      correctIndex: 2,
      explanation: `【音声】不安そうなので、そばにいてください。

指示（または状況）に合う対応は「様子を見守る」です。`,
    },
    {
      id: 51,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "混乱しています。看護師に相談してください。",
      choices: [
        "おむつを交換する / change a diaper",
        "ポータブルトイレを用意する / prepare portable toilet",
        "移動を介助する / assist moving",
        "看護師に連絡する / contact a nurse",
      ],
      correctIndex: 3,
      explanation: `【音声】混乱しています。看護師に相談してください。

指示（または状況）に合う対応は「看護師に連絡する」です。`,
    },
    {
      id: 52,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "大声で怒っています。",
      choices: [
        "歩行器を使う / use a walker",
        "声かけして安心させる / reassure with a voice",
        "口腔ケアをする / do oral care",
        "看護師に連絡する / contact a nurse",
      ],
      correctIndex: 1,
      explanation: `【音声】大声で怒っています。

指示（または状況）に合う対応は「声かけして安心させる」です。`,
    },
    {
      id: 53,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "トイレの場所がわかりません。",
      choices: [
        "救急搬送を手配する / arrange emergency transport",
        "声かけして安心させる / reassure with a voice",
        "リフトを使う / use a lift",
        "端座位にする / sit on the edge of bed",
      ],
      correctIndex: 1,
      explanation: `【音声】トイレの場所がわかりません。

指示（または状況）に合う対応は「声かけして安心させる」です。`,
    },
    {
      id: 54,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "転倒しそうです。",
      choices: [
        "転倒を防ぐ / prevent falls",
        "窒息に対応する / respond to choking",
        "様子を見守る / keep watching",
        "発赤を確認する / check redness",
      ],
      correctIndex: 0,
      explanation: `【音声】転倒しそうです。

指示（または状況）に合う対応は「転倒を防ぐ」です。`,
    },
    {
      id: 55,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "徘徊しています。見守ってください。",
      choices: [
        "様子を見守る / keep watching",
        "褥瘡を確認する / check pressure sores",
        "入浴介助をする / assist bathing",
        "発赤を確認する / check redness",
      ],
      correctIndex: 0,
      explanation: `【音声】徘徊しています。見守ってください。

指示（または状況）に合う対応は「様子を見守る」です。`,
    },
    {
      id: 56,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "興奮しています。静かな場所へ。",
      choices: [
        "整容を手伝う / assist grooming",
        "様子を見守る / keep watching",
        "移動を介助する / assist moving",
        "車椅子を準備する / prepare a wheelchair",
      ],
      correctIndex: 1,
      explanation: `【音声】興奮しています。静かな場所へ。

指示（または状況）に合う対応は「様子を見守る」です。`,
    },
    {
      id: 57,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "せん妄の可能性があります。",
      choices: [
        "とろみを付ける / add thickener",
        "移動を介助する / assist moving",
        "看護師に連絡する / contact a nurse",
        "残食を確認する / check leftovers",
      ],
      correctIndex: 2,
      explanation: `【音声】せん妄の可能性があります。

指示（または状況）に合う対応は「看護師に連絡する」です。`,
    },
    {
      id: 58,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "異食をしています。",
      choices: [
        "申し送りをする / handover information",
        "移動を介助する / assist moving",
        "様子を見守る / keep watching",
        "ミキサー食にする / provide pureed diet",
      ],
      correctIndex: 2,
      explanation: `【音声】異食をしています。

指示（または状況）に合う対応は「様子を見守る」です。`,
    },
    {
      id: 59,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "妄想で不安です。",
      choices: [
        "SpO2を測る / measure oxygen saturation",
        "残食を確認する / check leftovers",
        "窒息に対応する / respond to choking",
        "声かけして安心させる / reassure with a voice",
      ],
      correctIndex: 3,
      explanation: `【音声】妄想で不安です。

指示（または状況）に合う対応は「声かけして安心させる」です。`,
    },
    {
      id: 60,
      sectionId: "dementia",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "羞恥心に配慮してください。",
      choices: [
        "発赤を確認する / check redness",
        "入浴介助をする / assist bathing",
        "声かけして安心させる / reassure with a voice",
        "離床を促す / encourage getting out of bed",
      ],
      correctIndex: 2,
      explanation: `【音声】羞恥心に配慮してください。

指示（または状況）に合う対応は「声かけして安心させる」です。`,
    },
    {
      id: 61,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ナースコールが鳴っています。",
      choices: [
        "清拭をする / wipe the body",
        "ナースコールを確認する / check nurse call",
        "更衣を手伝う / assist dressing",
        "自助具を準備する / prepare assistive device",
      ],
      correctIndex: 1,
      explanation: `【音声】ナースコールが鳴っています。

指示（または状況）に合う対応は「ナースコールを確認する」です。`,
    },
    {
      id: 62,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ポータブルトイレを用意してください。",
      choices: [
        "ポータブルトイレを用意する / prepare portable toilet",
        "窒息に対応する / respond to choking",
        "とろみを付ける / add thickener",
        "声かけして安心させる / reassure with a voice",
      ],
      correctIndex: 0,
      explanation: `【音声】ポータブルトイレを用意してください。

指示（または状況）に合う対応は「ポータブルトイレを用意する」です。`,
    },
    {
      id: 63,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "リフトで移します。準備してください。",
      choices: [
        "移乗を手伝う / assist transfer",
        "リフトを使う / use a lift",
        "バイタルを測る / check vitals",
        "端座位にする / sit on the edge of bed",
      ],
      correctIndex: 1,
      explanation: `【音声】リフトで移します。準備してください。

指示（または状況）に合う対応は「リフトを使う」です。`,
    },
    {
      id: 64,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ストレッチャーを持ってきてください。",
      choices: [
        "ストレッチャーを用意する / prepare a stretcher",
        "トイレへ誘導する / guide to toilet",
        "声かけして安心させる / reassure with a voice",
        "車椅子を準備する / prepare a wheelchair",
      ],
      correctIndex: 0,
      explanation: `【音声】ストレッチャーを持ってきてください。

指示（または状況）に合う対応は「ストレッチャーを用意する」です。`,
    },
    {
      id: 65,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "手すりを使います。安全を確認してください。",
      choices: [
        "排泄介助をする / assist toileting",
        "転倒を防ぐ / prevent falls",
        "更衣を手伝う / assist dressing",
        "隔離する / isolate",
      ],
      correctIndex: 1,
      explanation: `【音声】手すりを使います。安全を確認してください。

指示（または状況）に合う対応は「転倒を防ぐ」です。`,
    },
    {
      id: 66,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "介護ベッドの柵を上げてください。",
      choices: [
        "急変に備える / prepare for sudden change",
        "ベッドの柵を上げる / raise the bed rails",
        "端座位にする / sit on the edge of bed",
        "入浴介助をする / assist bathing",
      ],
      correctIndex: 1,
      explanation: `【音声】介護ベッドの柵を上げてください。

指示（または状況）に合う対応は「ベッドの柵を上げる」です。`,
    },
    {
      id: 67,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "尿取りパッドを交換してください。",
      choices: [
        "杖を使う / use a cane",
        "おむつを交換する / change a diaper",
        "自助具を準備する / prepare assistive device",
        "申し送りをする / handover information",
      ],
      correctIndex: 1,
      explanation: `【音声】尿取りパッドを交換してください。

指示（または状況）に合う対応は「おむつを交換する」です。`,
    },
    {
      id: 68,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "車椅子のブレーキを確認してください。",
      choices: [
        "SpO2を測る / measure oxygen saturation",
        "記録を残す / write a record",
        "体位変換をする / change position",
        "転倒を防ぐ / prevent falls",
      ],
      correctIndex: 3,
      explanation: `【音声】車椅子のブレーキを確認してください。

指示（または状況）に合う対応は「転倒を防ぐ」です。`,
    },
    {
      id: 69,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "歩行器を使うので近くに置いてください。",
      choices: [
        "発赤を確認する / check redness",
        "ミキサー食にする / provide pureed diet",
        "浮腫を確認する / check swelling",
        "歩行器を使う / use a walker",
      ],
      correctIndex: 3,
      explanation: `【音声】歩行器を使うので近くに置いてください。

指示（または状況）に合う対応は「歩行器を使う」です。`,
    },
    {
      id: 70,
      sectionId: "equipment",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "杖を準備してください。",
      choices: [
        "清拭をする / wipe the body",
        "更衣を手伝う / assist dressing",
        "杖を使う / use a cane",
        "リフトを使う / use a lift",
      ],
      correctIndex: 2,
      explanation: `【音声】杖を準備してください。

指示（または状況）に合う対応は「杖を使う」です。`,
    },
    {
      id: 71,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ケース記録を書いてください。",
      choices: [
        "おむつを交換する / change a diaper",
        "記録を残す / write a record",
        "救急搬送を手配する / arrange emergency transport",
        "ベッドの柵を上げる / raise the bed rails",
      ],
      correctIndex: 1,
      explanation: `【音声】ケース記録を書いてください。

指示（または状況）に合う対応は「記録を残す」です。`,
    },
    {
      id: 72,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "申し送りをお願いします。",
      choices: [
        "排泄介助をする / assist toileting",
        "急変に備える / prepare for sudden change",
        "血圧を測る / measure blood pressure",
        "申し送りをする / handover information",
      ],
      correctIndex: 3,
      explanation: `【音声】申し送りをお願いします。

指示（または状況）に合う対応は「申し送りをする」です。`,
    },
    {
      id: 73,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ヒヤリハットを報告してください。",
      choices: [
        "ヒヤリハットを報告する / report a near-miss",
        "刻み食にする / provide minced diet",
        "身体拘束をしない / avoid restraints",
        "水分をすすめる / encourage hydration",
      ],
      correctIndex: 0,
      explanation: `【音声】ヒヤリハットを報告してください。

指示（または状況）に合う対応は「ヒヤリハットを報告する」です。`,
    },
    {
      id: 74,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "バイタル表に記入してください。",
      choices: [
        "記録を残す / write a record",
        "ベッドの柵を上げる / raise the bed rails",
        "発赤を確認する / check redness",
        "刻み食にする / provide minced diet",
      ],
      correctIndex: 0,
      explanation: `【音声】バイタル表に記入してください。

指示（または状況）に合う対応は「記録を残す」です。`,
    },
    {
      id: 75,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "モニタリング結果を書いてください。",
      choices: [
        "記録を残す / write a record",
        "トイレへ誘導する / guide to toilet",
        "血圧を測る / measure blood pressure",
        "移動を介助する / assist moving",
      ],
      correctIndex: 0,
      explanation: `【音声】モニタリング結果を書いてください。

指示（または状況）に合う対応は「記録を残す」です。`,
    },
    {
      id: 76,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "担当者会議の準備をしてください。",
      choices: [
        "残食を確認する / check leftovers",
        "浮腫を確認する / check swelling",
        "声かけして安心させる / reassure with a voice",
        "申し送りをする / handover information",
      ],
      correctIndex: 3,
      explanation: `【音声】担当者会議の準備をしてください。

指示（または状況）に合う対応は「申し送りをする」です。`,
    },
    {
      id: 77,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "同意書を確認してください。",
      choices: [
        "杖を使う / use a cane",
        "おむつを交換する / change a diaper",
        "バイタルを測る / check vitals",
        "記録を残す / write a record",
      ],
      correctIndex: 3,
      explanation: `【音声】同意書を確認してください。

指示（または状況）に合う対応は「記録を残す」です。`,
    },
    {
      id: 78,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "介護計画書を見直します。",
      choices: [
        "ナースコールを確認する / check nurse call",
        "記録を残す / write a record",
        "誤薬を防ぐ / prevent medication errors",
        "様子を見守る / keep watching",
      ],
      correctIndex: 1,
      explanation: `【音声】介護計画書を見直します。

指示（または状況）に合う対応は「記録を残す」です。`,
    },
    {
      id: 79,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "サマリーを作ってください。",
      choices: [
        "水分をすすめる / encourage hydration",
        "ヒヤリハットを報告する / report a near-miss",
        "記録を残す / write a record",
        "歩行器を使う / use a walker",
      ],
      correctIndex: 2,
      explanation: `【音声】サマリーを作ってください。

指示（または状況）に合う対応は「記録を残す」です。`,
    },
    {
      id: 80,
      sectionId: "record",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ステ（ナースステーション）に報告してください。",
      choices: [
        "看護師に連絡する / contact a nurse",
        "下膳する / clear dishes",
        "残食を確認する / check leftovers",
        "車椅子を準備する / prepare a wheelchair",
      ],
      correctIndex: 0,
      explanation: `【音声】ステ（ナースステーション）に報告してください。

指示（または状況）に合う対応は「看護師に連絡する」です。`,
    },
    {
      id: 81,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ケアマネジャーに連絡してください。",
      choices: [
        "移動を介助する / assist moving",
        "申し送りをする / handover information",
        "声かけして安心させる / reassure with a voice",
        "発赤を確認する / check redness",
      ],
      correctIndex: 1,
      explanation: `【音声】ケアマネジャーに連絡してください。

指示（または状況）に合う対応は「申し送りをする」です。`,
    },
    {
      id: 82,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "看護師を呼んでください。",
      choices: [
        "看護師に連絡する / contact a nurse",
        "誤薬を防ぐ / prevent medication errors",
        "配膳する / serve meals",
        "SpO2を測る / measure oxygen saturation",
      ],
      correctIndex: 0,
      explanation: `【音声】看護師を呼んでください。

指示（または状況）に合う対応は「看護師に連絡する」です。`,
    },
    {
      id: 83,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "PTに相談してください。",
      choices: [
        "様子を見守る / keep watching",
        "申し送りをする / handover information",
        "急変に備える / prepare for sudden change",
        "看護師に連絡する / contact a nurse",
      ],
      correctIndex: 1,
      explanation: `【音声】PTに相談してください。

指示（または状況）に合う対応は「申し送りをする」です。`,
    },
    {
      id: 84,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "OTに相談してください。",
      choices: [
        "水分をすすめる / encourage hydration",
        "申し送りをする / handover information",
        "救急搬送を手配する / arrange emergency transport",
        "発赤を確認する / check redness",
      ],
      correctIndex: 1,
      explanation: `【音声】OTに相談してください。

指示（または状況）に合う対応は「申し送りをする」です。`,
    },
    {
      id: 85,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "特養の利用者さんです。",
      choices: [
        "リフトを使う / use a lift",
        "様子を見守る / keep watching",
        "歩行器を使う / use a walker",
        "SpO2を測る / measure oxygen saturation",
      ],
      correctIndex: 1,
      explanation: `【音声】特養の利用者さんです。

指示（または状況）に合う対応は「様子を見守る」です。`,
    },
    {
      id: 86,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "老健に移動します。車椅子を準備。",
      choices: [
        "車椅子を準備する / prepare a wheelchair",
        "様子を見守る / keep watching",
        "SpO2を測る / measure oxygen saturation",
        "刻み食にする / provide minced diet",
      ],
      correctIndex: 0,
      explanation: `【音声】老健に移動します。車椅子を準備。

指示（または状況）に合う対応は「車椅子を準備する」です。`,
    },
    {
      id: 87,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "デイサービスの送迎に行きます。",
      choices: [
        "移動を介助する / assist moving",
        "浮腫を確認する / check swelling",
        "感染対策をする / take infection control",
        "転倒を防ぐ / prevent falls",
      ],
      correctIndex: 0,
      explanation: `【音声】デイサービスの送迎に行きます。

指示（または状況）に合う対応は「移動を介助する」です。`,
    },
    {
      id: 88,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "グループホームの連絡帳を書いてください。",
      choices: [
        "発赤を確認する / check redness",
        "排泄介助をする / assist toileting",
        "更衣を手伝う / assist dressing",
        "記録を残す / write a record",
      ],
      correctIndex: 3,
      explanation: `【音声】グループホームの連絡帳を書いてください。

指示（または状況）に合う対応は「記録を残す」です。`,
    },
    {
      id: 89,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ヘルパーさんに申し送りを。",
      choices: [
        "端座位にする / sit on the edge of bed",
        "ミキサー食にする / provide pureed diet",
        "申し送りをする / handover information",
        "整容を手伝う / assist grooming",
      ],
      correctIndex: 2,
      explanation: `【音声】ヘルパーさんに申し送りを。

指示（または状況）に合う対応は「申し送りをする」です。`,
    },
    {
      id: 90,
      sectionId: "facility",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "入居者さんの様子を確認してください。",
      choices: [
        "ベッドの柵を上げる / raise the bed rails",
        "様子を見守る / keep watching",
        "体位変換をする / change position",
        "清拭をする / wipe the body",
      ],
      correctIndex: 1,
      explanation: `【音声】入居者さんの様子を確認してください。

指示（または状況）に合う対応は「様子を見守る」です。`,
    },
    {
      id: 91,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "転倒しそうです。支えてください。",
      choices: [
        "転倒を防ぐ / prevent falls",
        "ストレッチャーを用意する / prepare a stretcher",
        "看護師に連絡する / contact a nurse",
        "感染対策をする / take infection control",
      ],
      correctIndex: 0,
      explanation: `【音声】転倒しそうです。支えてください。

指示（または状況）に合う対応は「転倒を防ぐ」です。`,
    },
    {
      id: 92,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "ベッドから落ちそうです。",
      choices: [
        "ミキサー食にする / provide pureed diet",
        "転倒を防ぐ / prevent falls",
        "ヒヤリハットを報告する / report a near-miss",
        "食事介助をする / assist eating",
      ],
      correctIndex: 1,
      explanation: `【音声】ベッドから落ちそうです。

指示（または状況）に合う対応は「転倒を防ぐ」です。`,
    },
    {
      id: 93,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "急変です。すぐ連絡してください。",
      choices: [
        "整容を手伝う / assist grooming",
        "トイレへ誘導する / guide to toilet",
        "看護師に連絡する / contact a nurse",
        "離床を促す / encourage getting out of bed",
      ],
      correctIndex: 2,
      explanation: `【音声】急変です。すぐ連絡してください。

指示（または状況）に合う対応は「看護師に連絡する」です。`,
    },
    {
      id: 94,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "窒息です。対応してください。",
      choices: [
        "浮腫を確認する / check swelling",
        "感染対策をする / take infection control",
        "配膳する / serve meals",
        "窒息に対応する / respond to choking",
      ],
      correctIndex: 3,
      explanation: `【音声】窒息です。対応してください。

指示（または状況）に合う対応は「窒息に対応する」です。`,
    },
    {
      id: 95,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "脱水の可能性があります。",
      choices: [
        "水分をすすめる / encourage hydration",
        "口腔ケアをする / do oral care",
        "転倒を防ぐ / prevent falls",
        "入浴介助をする / assist bathing",
      ],
      correctIndex: 0,
      explanation: `【音声】脱水の可能性があります。

指示（または状況）に合う対応は「水分をすすめる」です。`,
    },
    {
      id: 96,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "熱中症に注意してください。",
      choices: [
        "水分をすすめる / encourage hydration",
        "整容を手伝う / assist grooming",
        "感染対策をする / take infection control",
        "リフトを使う / use a lift",
      ],
      correctIndex: 0,
      explanation: `【音声】熱中症に注意してください。

指示（または状況）に合う対応は「水分をすすめる」です。`,
    },
    {
      id: 97,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "感染症の疑いです。隔離してください。",
      choices: [
        "更衣を手伝う / assist dressing",
        "隔離する / isolate",
        "排泄介助をする / assist toileting",
        "身体拘束をしない / avoid restraints",
      ],
      correctIndex: 1,
      explanation: `【音声】感染症の疑いです。隔離してください。

指示（または状況）に合う対応は「隔離する」です。`,
    },
    {
      id: 98,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "身体拘束はしないでください。",
      choices: [
        "ストレッチャーを用意する / prepare a stretcher",
        "身体拘束をしない / avoid restraints",
        "血圧を測る / measure blood pressure",
        "トイレへ誘導する / guide to toilet",
      ],
      correctIndex: 1,
      explanation: `【音声】身体拘束はしないでください。

指示（または状況）に合う対応は「身体拘束をしない」です。`,
    },
    {
      id: 99,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "虐待の疑いがあります。報告してください。",
      choices: [
        "移動を介助する / assist moving",
        "血圧を測る / measure blood pressure",
        "ヒヤリハットを報告する / report a near-miss",
        "感染対策をする / take infection control",
      ],
      correctIndex: 2,
      explanation: `【音声】虐待の疑いがあります。報告してください。

指示（または状況）に合う対応は「ヒヤリハットを報告する」です。`,
    },
    {
      id: 100,
      sectionId: "risk",
      question: "【聴解】音声を聞いて、どうしますか？",
      listeningText: "誤薬がないよう確認してください。",
      choices: [
        "声かけして安心させる / reassure with a voice",
        "様子を見守る / keep watching",
        "下膳する / clear dishes",
        "誤薬を防ぐ / prevent medication errors",
      ],
      correctIndex: 3,
      explanation: `【音声】誤薬がないよう確認してください。

指示（または状況）に合う対応は「誤薬を防ぐ」です。`,
    },
  ],
}
