import type { Quiz } from "@/app/data/types"

export const constructionTermsImageQuiz: Quiz = {
  id: "construction-terms-image",
  title: "建設・現場 用語（画像）",
  description: "画像から用語を答える問題",
  questions: [
    {
      id: 1,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["鉄筋ハッカー", "工事用黒板", "インパクトドライバー", "墨つぼ"],
      correctIndex: 2,
      imageUrl: "/construction-terms/tools/インパクトドライバー.jpg",
      explanation: "インパクトドライバー のこと。"
    },
    {
      id: 2,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["墨つぼ", "鉄筋ハッカー", "スケール", "防護ゴーグル"],
      correctIndex: 2,
      imageUrl: "/construction-terms/tools/スケール.jpg",
      explanation: "スケール のこと。"
    },
    {
      id: 3,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["レーザー距離計", "バタ角", "ネコ", "工事用黒板"],
      correctIndex: 0,
      imageUrl: "/construction-terms/tools/レーザー距離計.jpg",
      explanation: "レーザー距離計 のこと。"
    },
    {
      id: 4,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["立ち馬", "墨つぼ", "ネコ", "防護ゴーグル"],
      correctIndex: 1,
      imageUrl: "/construction-terms/tools/墨つぼ.jpg",
      explanation: "墨つぼ のこと。"
    },
    {
      id: 5,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["防護ゴーグル", "シールテープ", "工事用黒板", "レーザー距離計"],
      correctIndex: 2,
      imageUrl: "/construction-terms/tools/工事用黒板.jpg",
      explanation: "工事用黒板 のこと。"
    },
    {
      id: 6,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["ネコ", "コードリール", "レーザー距離計", "インパクトドライバー"],
      correctIndex: 1,
      imageUrl: "/construction-terms/tools/コードリール.jpg",
      explanation: "コードリール のこと。"
    },
    {
      id: 7,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["防護ゴーグル", "スケール", "ネコ", "工事用黒板"],
      correctIndex: 0,
      imageUrl: "/construction-terms/tools/防護ゴーグル.jpg",
      explanation: "防護ゴーグル のこと。"
    },
    {
      id: 8,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["立ち馬", "インパクトドライバー", "バタ角", "コードリール"],
      correctIndex: 0,
      imageUrl: "/construction-terms/tools/立ち馬.jpg",
      explanation: "立ち馬 のこと。"
    },
    {
      id: 9,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["ネコ", "鉄筋ハッカー", "工事用黒板", "シールテープ"],
      correctIndex: 1,
      imageUrl: "/construction-terms/tools/鉄筋ハッカー.jpg",
      explanation: "鉄筋ハッカー のこと。"
    },
    {
      id: 10,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["墨つぼ", "スケール", "ネコ", "シールテープ"],
      correctIndex: 3,
      imageUrl: "/construction-terms/tools/シールテープ.jpg",
      explanation: "シールテープ のこと。"
    },
    {
      id: 11,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["コードリール", "バタ角", "ネコ", "墨つぼ"],
      correctIndex: 2,
      imageUrl: "/construction-terms/tools/ネコ.jpg",
      explanation: "ネコ のこと。"
    },
    {
      id: 12,
      sectionId: "tools",
      question: "この画像の用語はどれか。",
      choices: ["コードリール", "防護ゴーグル", "バタ角", "スケール"],
      correctIndex: 2,
      imageUrl: "/construction-terms/tools/バタ角.jpg",
      explanation: "バタ角 のこと。"
    },
    {
      id: 13,
      sectionId: "architecture",
      question: "この画像の用語はどれか。",
      choices: ["墨だし", "施工図", "間取り", "RC造"],
      correctIndex: 3,
      imageUrl: "/construction-terms/architecture/RC造.jpg",
      explanation: "RC造 のこと。"
    },
    {
      id: 14,
      sectionId: "architecture",
      question: "この画像の用語はどれか。",
      choices: ["根切", "S造", "施工図", "RC造"],
      correctIndex: 1,
      imageUrl: "/construction-terms/architecture/S造.jpg",
      explanation: "S造 のこと。"
    },
    {
      id: 15,
      sectionId: "architecture",
      question: "この画像の用語はどれか。",
      choices: ["RC造", "根切", "S造", "ALC"],
      correctIndex: 3,
      imageUrl: "/construction-terms/architecture/ALC.jpg",
      explanation: "ALC のこと。"
    },
    {
      id: 16,
      sectionId: "architecture",
      question: "この画像の用語はどれか。",
      choices: ["墨だし", "根切", "透湿防水シート", "施工図"],
      correctIndex: 3,
      imageUrl: "/construction-terms/architecture/施工図.jpg",
      explanation: "施工図 のこと。"
    },
    {
      id: 17,
      sectionId: "architecture",
      question: "この画像の用語はどれか。",
      choices: ["墨だし", "間取り", "根切", "施工図"],
      correctIndex: 0,
      imageUrl: "/construction-terms/architecture/墨だし.jpg",
      explanation: "墨だし のこと。"
    },
    {
      id: 18,
      sectionId: "architecture",
      question: "この画像の用語はどれか。",
      choices: ["ALC", "透湿防水シート", "根切", "RC造"],
      correctIndex: 2,
      imageUrl: "/construction-terms/architecture/根切.jpg",
      explanation: "根切 のこと。"
    },
    {
      id: 19,
      sectionId: "architecture",
      question: "この画像の用語はどれか。",
      choices: ["間取り", "透湿防水シート", "墨だし", "S造"],
      correctIndex: 1,
      imageUrl: "/construction-terms/architecture/透湿防水シート.jpg",
      explanation: "透湿防水シート のこと。"
    },
    {
      id: 20,
      sectionId: "architecture",
      question: "この画像の用語はどれか。",
      choices: ["施工図", "ALC", "S造", "間取り"],
      correctIndex: 3,
      imageUrl: "/construction-terms/architecture/間取り.jpg",
      explanation: "間取り のこと。"
    },
    {
      id: 21,
      sectionId: "civil",
      question: "この画像の用語はどれか。",
      choices: ["橋台", "ブルドーザー", "法面", "ボックスカルバート"],
      correctIndex: 1,
      imageUrl: "/construction-terms/civil/ブルドーザー.jpg",
      explanation: "ブルドーザー のこと。"
    },
    {
      id: 22,
      sectionId: "civil",
      question: "この画像の用語はどれか。",
      choices: ["トンネル掘削", "法面", "基礎工", "ボックスカルバート"],
      correctIndex: 3,
      imageUrl: "/construction-terms/civil/ボックスカルバート.jpg",
      explanation: "ボックスカルバート のこと。"
    },
    {
      id: 23,
      sectionId: "civil",
      question: "この画像の用語はどれか。",
      choices: ["ブルドーザー", "トンネル掘削", "基礎工", "法面"],
      correctIndex: 1,
      imageUrl: "/construction-terms/civil/トンネル掘削.jpg",
      explanation: "トンネル掘削 のこと。"
    },
    {
      id: 24,
      sectionId: "civil",
      question: "この画像の用語はどれか。",
      choices: ["基礎工", "ボックスカルバート", "法面", "ブルドーザー"],
      correctIndex: 2,
      imageUrl: "/construction-terms/civil/法面.jpg",
      explanation: "法面 のこと。"
    },
    {
      id: 25,
      sectionId: "civil",
      question: "この画像の用語はどれか。",
      choices: ["プレキャストコンクリート", "法面", "トンネル掘削", "砂防ダム"],
      correctIndex: 3,
      imageUrl: "/construction-terms/civil/砂防ダム.jpg",
      explanation: "砂防ダム のこと。"
    },
    {
      id: 26,
      sectionId: "civil",
      question: "この画像の用語はどれか。",
      choices: ["トンネル掘削", "法面", "基礎工", "橋台"],
      correctIndex: 2,
      imageUrl: "/construction-terms/civil/基礎工.jpg",
      explanation: "基礎工 のこと。"
    },
    {
      id: 27,
      sectionId: "civil",
      question: "この画像の用語はどれか。",
      choices: ["プレキャストコンクリート", "トンネル掘削", "砂防ダム", "橋台"],
      correctIndex: 3,
      imageUrl: "/construction-terms/civil/橋台.jpg",
      explanation: "橋台 のこと。"
    },
    {
      id: 28,
      sectionId: "civil",
      question: "この画像の用語はどれか。",
      choices: ["ボックスカルバート", "橋台", "プレキャストコンクリート", "ブルドーザー"],
      correctIndex: 2,
      imageUrl: "/construction-terms/civil/プレキャストコンクリート.jpg",
      explanation: "プレキャストコンクリート のこと。"
    },
    {
      id: 29,
      sectionId: "electric",
      question: "この画像の用語はどれか。",
      choices: ["分電盤", "遮断器", "接地", "変圧器"],
      correctIndex: 3,
      imageUrl: "/construction-terms/electric/変圧器.jpg",
      explanation: "変圧器 のこと。"
    },
    {
      id: 30,
      sectionId: "electric",
      question: "この画像の用語はどれか。",
      choices: ["遮断器", "検電器", "電気回路", "分電盤"],
      correctIndex: 3,
      imageUrl: "/construction-terms/electric/分電盤.jpg",
      explanation: "分電盤 のこと。"
    },
    {
      id: 31,
      sectionId: "electric",
      question: "この画像の用語はどれか。",
      choices: ["遮断器", "高圧受電設備", "接地", "変圧器"],
      correctIndex: 1,
      imageUrl: "/construction-terms/electric/高圧受電設備.jpg",
      explanation: "高圧受電設備 のこと。"
    },
    {
      id: 32,
      sectionId: "electric",
      question: "この画像の用語はどれか。",
      choices: ["遮断器", "発電機", "電気回路", "検電器"],
      correctIndex: 1,
      imageUrl: "/construction-terms/electric/発電機.jpg",
      explanation: "発電機 のこと。"
    },
    {
      id: 33,
      sectionId: "electric",
      question: "この画像の用語はどれか。",
      choices: ["変圧器", "発電機", "検電器", "接地"],
      correctIndex: 2,
      imageUrl: "/construction-terms/electric/検電器.jpg",
      explanation: "検電器 のこと。"
    },
    {
      id: 34,
      sectionId: "electric",
      question: "この画像の用語はどれか。",
      choices: ["接地", "電気回路", "分電盤", "検電器"],
      correctIndex: 0,
      imageUrl: "/construction-terms/electric/接地.jpg",
      explanation: "接地 のこと。"
    },
    {
      id: 35,
      sectionId: "electric",
      question: "この画像の用語はどれか。",
      choices: ["電気回路", "変圧器", "高圧受電設備", "遮断器"],
      correctIndex: 3,
      imageUrl: "/construction-terms/electric/遮断器.jpg",
      explanation: "遮断器 のこと。"
    },
    {
      id: 36,
      sectionId: "electric",
      question: "この画像の用語はどれか。",
      choices: ["発電機", "接地", "遮断器", "電気回路"],
      correctIndex: 3,
      imageUrl: "/construction-terms/electric/電気回路.jpg",
      explanation: "電気回路 のこと。"
    },
    {
      id: 37,
      sectionId: "hvac",
      question: "この画像の用語はどれか。",
      choices: ["給排気", "換気", "吸収式冷凍機", "ダクト"],
      correctIndex: 3,
      imageUrl: "/construction-terms/hvac/ダクト.jpg",
      explanation: "ダクト のこと。"
    },
    {
      id: 38,
      sectionId: "hvac",
      question: "この画像の用語はどれか。",
      choices: ["排水槽", "冷却塔", "ダクト", "換気"],
      correctIndex: 1,
      imageUrl: "/construction-terms/hvac/冷却塔.jpg",
      explanation: "冷却塔 のこと。"
    },
    {
      id: 39,
      sectionId: "hvac",
      question: "この画像の用語はどれか。",
      choices: ["換気", "給排気", "吸収式冷凍機", "ダクト"],
      correctIndex: 2,
      imageUrl: "/construction-terms/hvac/吸収式冷凍機.jpg",
      explanation: "吸収式冷凍機 のこと。"
    },
    {
      id: 40,
      sectionId: "hvac",
      question: "この画像の用語はどれか。",
      choices: ["排水槽", "給排気", "冷却塔", "吸収式冷凍機"],
      correctIndex: 0,
      imageUrl: "/construction-terms/hvac/排水槽.jpg",
      explanation: "排水槽 のこと。"
    },
    {
      id: 41,
      sectionId: "hvac",
      question: "この画像の用語はどれか。",
      choices: ["換気", "給排気", "ダクト", "排水槽"],
      correctIndex: 0,
      imageUrl: "/construction-terms/hvac/換気.jpg",
      explanation: "換気 のこと。"
    },
    {
      id: 42,
      sectionId: "hvac",
      question: "この画像の用語はどれか。",
      choices: ["給排気", "排水槽", "換気", "冷却塔"],
      correctIndex: 0,
      imageUrl: "/construction-terms/hvac/給排気.jpg",
      explanation: "給排気 のこと。"
    },
    {
      id: 43,
      sectionId: "plant",
      question: "この画像の用語はどれか。",
      choices: ["抽出器", "流量計", "圧力計", "タービン"],
      correctIndex: 3,
      imageUrl: "/construction-terms/plant/タービン.jpg",
      explanation: "タービン のこと。"
    },
    {
      id: 44,
      sectionId: "plant",
      question: "この画像の用語はどれか。",
      choices: ["ボイラー", "コンデンサー", "タービン", "圧力計"],
      correctIndex: 1,
      imageUrl: "/construction-terms/plant/コンデンサー.jpg",
      explanation: "コンデンサー のこと。"
    },
    {
      id: 45,
      sectionId: "plant",
      question: "この画像の用語はどれか。",
      choices: ["温度計", "ボイラー", "コンデンサー", "圧力計"],
      correctIndex: 1,
      imageUrl: "/construction-terms/plant/ボイラー.jpg",
      explanation: "ボイラー のこと。"
    },
    {
      id: 46,
      sectionId: "plant",
      question: "この画像の用語はどれか。",
      choices: ["蒸留塔", "コンデンサー", "抽出器", "タービン"],
      correctIndex: 0,
      imageUrl: "/construction-terms/plant/蒸留塔.jpg",
      explanation: "蒸留塔 のこと。"
    },
    {
      id: 47,
      sectionId: "plant",
      question: "この画像の用語はどれか。",
      choices: ["コンデンサー", "圧力計", "抽出器", "タービン"],
      correctIndex: 2,
      imageUrl: "/construction-terms/plant/抽出器.jpg",
      explanation: "抽出器 のこと。"
    },
    {
      id: 48,
      sectionId: "plant",
      question: "この画像の用語はどれか。",
      choices: ["抽出器", "圧力計", "温度計", "タービン"],
      correctIndex: 1,
      imageUrl: "/construction-terms/plant/圧力計.jpg",
      explanation: "圧力計 のこと。"
    },
    {
      id: 49,
      sectionId: "plant",
      question: "この画像の用語はどれか。",
      choices: ["タービン", "流量計", "温度計", "コンデンサー"],
      correctIndex: 1,
      imageUrl: "/construction-terms/plant/流量計.jpg",
      explanation: "流量計 のこと。"
    },
    {
      id: 50,
      sectionId: "plant",
      question: "この画像の用語はどれか。",
      choices: ["ボイラー", "圧力計", "流量計", "温度計"],
      correctIndex: 3,
      imageUrl: "/construction-terms/plant/温度計.jpg",
      explanation: "温度計 のこと。"
    },
  ]
}
