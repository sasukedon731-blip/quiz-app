// app/data/quizCatalog.ts

export type QuizMode = "normal" | "exam" | "review"
export type IndustryId =
  | "construction"
  | "manufacturing"
  | "care"
  | "driver"
  | "undecided"

export type QuizSectionDef = {
  id: string
  title: string
  description?: string
  enabled: boolean
  order: number
}

export type QuizDef = {
  id: string
  title: string
  description?: string

  enabled: boolean
  order: number

  modes: QuizMode[]
  sections: QuizSectionDef[]

  // 業種別TOP表示用（未指定なら従来どおり全体扱い）
  industries?: IndustryId[] | "all"
}

/**
 * 🎯 全教材共通のカタログ
 */
export const quizCatalog: QuizDef[] = [
  // ===============================
  // 日本語・共通
  // ===============================
  {
    id: "gaikoku-license",
    title: "外国免許切替",
    description: "日本の交通ルール・標識・優先関係",
    enabled: true,
    order: 1,
    industries: ["driver"],
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "japanese-n4",
    title: "日本語検定 N4",
    description: "文法・語彙・読解・聴解",
    enabled: true,
    order: 2,
    industries: "all",
    modes: ["normal", "exam", "review"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "vocab", title: "文字・語彙", enabled: true, order: 2 },
      { id: "grammar", title: "文法", enabled: true, order: 3 },
      { id: "reading", title: "読解", enabled: true, order: 4 },
      { id: "listening", title: "聴解", enabled: true, order: 5 },
    ],
  },

  {
    id: "genba-listening",
    title: "現場用語リスニング",
    description: "建設・製造・介護の現場用語",
    enabled: true,
    order: 3,
    industries: "all",
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "japanese-n3",
    title: "日本語検定 N3",
    description: "文法・語彙・読解・聴解（N3）",
    enabled: true,
    order: 4,
    industries: "all",
    modes: ["normal", "exam", "review"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "vocab", title: "文字・語彙", enabled: true, order: 2 },
      { id: "grammar", title: "文法", enabled: true, order: 3 },
      { id: "reading", title: "読解", enabled: true, order: 4 },
      { id: "listening", title: "聴解", enabled: true, order: 5 },
    ],
  },

  {
    id: "japanese-n2",
    title: "日本語検定 N2",
    description: "文法・語彙・読解・聴解（N2）",
    enabled: true,
    order: 5,
    industries: "all",
    modes: ["normal", "exam", "review"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "vocab", title: "文字・語彙", enabled: true, order: 2 },
      { id: "grammar", title: "文法", enabled: true, order: 3 },
      { id: "reading", title: "読解", enabled: true, order: 4 },
      { id: "listening", title: "聴解", enabled: true, order: 5 },
    ],
  },

  {
    id: "speaking-practice",
    title: "スピーキング練習",
    description: "発話・シャドーイング・応答練習",
    enabled: true,
    order: 10,
    industries: "all",
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },
  {
    id: "kansai-listening",
    title: "関西弁リスニング",
    description: "関西弁のあいさつ・日常表現・会話表現を音声で学ぶ",
    enabled: true,
    order: 12,
    industries: ["undecided"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },
  {
    id: "dialect-meaning",
    title: "全国方言 意味当て",
    description: "各地の方言の意味を4択で学ぶ",
    enabled: true,
    order: 13,
    industries: ["undecided"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "genba-phrasebook",
    title: "現場で使える用語集（ヒアリング・スピーキング）",
    description: "現場フレーズの聞き取り＆言える化",
    enabled: true,
    order: 11,
    industries: "all",
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "road-signs",
    title: "道路標識マスター",
    description: "道路標識だけを集中的に学ぶ（画像つき）",
    enabled: true,
    order: 999,
    industries: ["driver"],
    modes: ["normal"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "warning", title: "警戒", enabled: true, order: 2 },
      { id: "regulation", title: "規制", enabled: true, order: 3 },
    ],
  },

  // ===============================
  // 建設
  // ===============================
  {
    id: "construction-tools",
    title: "建設道具クイズ",
    description: "建設現場で使う道具を4択で学ぶ",
    enabled: true,
    order: 20,
    industries: ["construction"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "hvac-terms",
    title: "空調衛生用語クイズ",
    description: "空調・衛生分野の重要用語を4択で学ぶ",
    enabled: true,
    order: 21,
    industries: ["construction"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "plant-terms",
    title: "プラント用語クイズ",
    description: "プラント分野の重要用語を4択で学ぶ",
    enabled: true,
    order: 22,
    industries: ["construction"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "architecture-terms",
    title: "建築用語クイズ",
    description: "建築分野の重要用語を4択で学ぶ",
    enabled: true,
    order: 23,
    industries: ["construction"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "construction-management-terms",
    title: "施工管理用語クイズ",
    description: "施工管理分野の重要用語を4択で学ぶ",
    enabled: true,
    order: 24,
    industries: ["construction"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "electric-terms",
    title: "電気用語クイズ",
    description: "電気分野の重要用語を4択で学ぶ",
    enabled: true,
    order: 25,
    industries: ["construction"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "civil-terms",
    title: "土木用語クイズ",
    description: "土木分野の重要用語を4択で学ぶ",
    enabled: true,
    order: 26,
    industries: ["construction"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "kenchiku-sekou-2kyu-1ji",
    title: "2級建築施工管理技士 1次",
    description: "施工管理（建築）一次の基礎",
    enabled: true,
    order: 60,
    industries: ["construction"],
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "doboku-sekou-2kyu-1ji",
    title: "2級土木施工管理技士 1次",
    description: "施工管理（土木）一次の基礎",
    enabled: true,
    order: 61,
    industries: ["construction"],
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "denki-sekou-2kyu-1ji",
    title: "2級電気施工管理技士 1次",
    description: "施工管理（電気）一次の基礎",
    enabled: true,
    order: 62,
    industries: ["construction"],
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "kanko-sekou-2kyu-1ji",
    title: "2級管工事施工管理技士 1次",
    description: "施工管理（管工事）一次の基礎",
    enabled: true,
    order: 63,
    industries: ["construction"],
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  // ===============================
  // 製造
  // ===============================
  {
    id: "manufacturing-meaning",
    title: "製造用語（意味→言葉）",
    description: "意味を読んで正しい製造用語を選ぶ",
    enabled: true,
    order: 70,
    industries: ["manufacturing"],
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "manufacturing-word",
    title: "製造用語（言葉→意味）",
    description: "製造用語の意味を4択で確認する",
    enabled: true,
    order: 71,
    industries: ["manufacturing"],
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "manufacturing-listening",
    title: "製造リスニング",
    description: "製造現場でよく聞く用語・指示を聞いて選ぶ",
    enabled: true,
    order: 72,
    industries: ["manufacturing"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "manufacturing-conversation",
    title: "製造現場会話（音声）",
    description: "製造現場の指示・会話を聞いて対応を選ぶ",
    enabled: true,
    order: 73,
    industries: ["manufacturing"],
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "manufacturing-conversation-50",
    title: "製造現場会話（読解）",
    description: "製造現場の会話を読んで正しい言葉を選ぶ",
    enabled: true,
    order: 74,
    industries: ["manufacturing"],
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  {
    id: "skill-test-machining",
    title: "技能検定 機械加工 学科",
    description: "技能検定の学科試験対策（○×問題）",
    enabled: true,
    order: 75,
    industries: ["manufacturing"],
    modes: ["normal", "exam", "review"],
    sections: [
      { id: "safety", title: "安全衛生・共通", enabled: true, order: 1 },
      { id: "machining", title: "機械加工", enabled: true, order: 2 },
    ],
  },

  // ===============================
  // 介護
  // ===============================
  {
    id: "care-terms",
    title: "介護用語（重要100）",
    description: "介護現場で必須の用語を4択で覚える",
    enabled: true,
    order: 80,
    industries: ["care"],
    modes: ["normal", "review"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "adl", title: "身体介助・基本動作", enabled: true, order: 2 },
      { id: "meal", title: "食事・水分", enabled: true, order: 3 },
      { id: "vital", title: "健康状態・バイタル", enabled: true, order: 4 },
      { id: "dementia", title: "認知症・メンタル", enabled: true, order: 5 },
      { id: "equipment", title: "用具・設備", enabled: true, order: 6 },
      { id: "record", title: "記録・事務", enabled: true, order: 7 },
      { id: "facility", title: "施設・専門職", enabled: true, order: 8 },
      { id: "risk", title: "リスク・緊急時", enabled: true, order: 9 },
    ],
  },

  {
    id: "care-listening",
    title: "介護リスニング（重要100）",
    description: "介護現場でよく聞く用語を聞いて意味を選ぶ",
    enabled: true,
    order: 81,
    industries: ["care"],
    modes: ["normal", "review"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "adl", title: "身体介助・基本動作", enabled: true, order: 2 },
      { id: "meal", title: "食事・水分", enabled: true, order: 3 },
      { id: "vital", title: "健康状態・バイタル", enabled: true, order: 4 },
      { id: "dementia", title: "認知症・メンタル", enabled: true, order: 5 },
      { id: "equipment", title: "用具・設備", enabled: true, order: 6 },
      { id: "record", title: "記録・事務", enabled: true, order: 7 },
      { id: "facility", title: "施設・専門職", enabled: true, order: 8 },
      { id: "risk", title: "リスク・緊急時", enabled: true, order: 9 },
    ],
  },

  {
    id: "care-conversation",
    title: "介護現場会話（重要100）",
    description: "介護現場の指示・会話を聞いて対応を選ぶ",
    enabled: true,
    order: 82,
    industries: ["care"],
    modes: ["normal", "review"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "adl", title: "身体介助・基本動作", enabled: true, order: 2 },
      { id: "meal", title: "食事・水分", enabled: true, order: 3 },
      { id: "vital", title: "健康状態・バイタル", enabled: true, order: 4 },
      { id: "dementia", title: "認知症・メンタル", enabled: true, order: 5 },
      { id: "equipment", title: "用具・設備", enabled: true, order: 6 },
      { id: "record", title: "記録・事務", enabled: true, order: 7 },
      { id: "facility", title: "施設・専門職", enabled: true, order: 8 },
      { id: "risk", title: "リスク・緊急時", enabled: true, order: 9 },
    ],
  },
  {
    id: "care-worker-exam",
    title: "介護福祉士試験",
    description: "介護福祉士国家試験レベルの知識を学ぶ",
    enabled: true,
    order: 40,
    industries: ["care"],
    modes: ["normal","exam","review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },
]

/**
 * util: quizType から定義を取得（enabled のみ）
 */
export function getQuizDef(quizType: string): QuizDef | undefined {
  return quizCatalog.find((q) => q.id === quizType && q.enabled)
}

/**
 * util: sectionId を解決（無ければ all）
 * ✅ sections が空でも落ちないよう安全化
 */
export function resolveSection(
  quiz: QuizDef,
  sectionId?: string | null,
): QuizSectionDef {
  const enabledSections = (quiz.sections ?? [])
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)

  const fallback: QuizSectionDef =
    enabledSections[0] ?? {
      id: "all",
      title: "総合",
      enabled: true,
      order: 1,
    }

  if (!sectionId) return fallback
  return enabledSections.find((s) => s.id === sectionId) ?? fallback
}
