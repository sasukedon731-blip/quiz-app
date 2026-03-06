// app/data/quizCatalog.ts

export type QuizMode = "normal" | "exam" | "review"

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
}

/**
 * 🎯 全教材共通のカタログ
 */
export const quizCatalog: QuizDef[] = [
  {
    id: "gaikoku-license",
    title: "外国免許切替",
    description: "日本の交通ルール・標識・優先関係",
    enabled: true,
    order: 1,
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "japanese-n4",
    title: "日本語検定 N4",
    description: "文法・語彙・読解・聴解",
    enabled: true,
    order: 2,
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
    description: "建設・製造の現場用語",
    enabled: true,
    order: 3,
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  // -------------------------------
  // 追加：10+教材の箱（課金/選択テスト用）
  // -------------------------------

  {
    id: "japanese-n3",
    title: "日本語検定 N3",
    description: "文法・語彙・読解・聴解（N3）",
    enabled: true,
    order: 4,
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
    id: "road-signs",
    title: "道路標識マスター",
    description: "道路標識だけを集中的に学ぶ（画像つき）",
    enabled: true,
    order: 999,
    modes: ["normal"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "warning", title: "警戒", enabled: true, order: 2 },
      { id: "regulation", title: "規制", enabled: true, order: 3 },
    ],
  },

  {
    id: "japanese-n2",
    title: "日本語検定 N2",
    description: "文法・語彙・読解・聴解（N2）",
    enabled: true,
    order: 5,
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
    id: "kenchiku-sekou-2kyu-1ji",
    title: "2級建築施工管理技士 1次",
    description: "施工管理（建築）一次の基礎",
    enabled: true,
    order: 6,
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "doboku-sekou-2kyu-1ji",
    title: "2級土木施工管理技士 1次",
    description: "施工管理（土木）一次の基礎",
    enabled: true,
    order: 7,
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "denki-sekou-2kyu-1ji",
    title: "2級電気施工管理技士 1次",
    description: "施工管理（電気）一次の基礎",
    enabled: true,
    order: 8,
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "kanko-sekou-2kyu-1ji",
    title: "2級管工事施工管理技士 1次",
    description: "施工管理（管工事）一次の基礎",
    enabled: true,
    order: 9,
    modes: ["normal", "exam", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "speaking-practice",
    title: "スピーキング練習",
    description: "発話・シャドーイング・応答練習",
    enabled: true,
    order: 10,
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },

  {
    id: "genba-phrasebook",
    title: "現場で使える用語集（ヒアリング・スピーキング）",
    description: "現場フレーズの聞き取り＆言える化",
    enabled: true,
    order: 11,
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "総合", enabled: true, order: 1 }],
  },


  // ✅ 製造（追加）
  {
    id: "manufacturing-terms",
    title: "製造用語",
    description: "やさしい日本語＋英語補助で製造の重要用語を覚える",
    enabled: true,
    order: 60,
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },
  {
    id: "manufacturing-listening",
    title: "製造リスニング",
    description: "製造現場でよく聞く用語・指示を聞いて選ぶ",
    enabled: true,
    order: 61,
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },
  {
    id: "manufacturing-conversation",
    title: "製造現場会話",
    description: "製造現場の指示・会話を聞いて対応を選ぶ",
    enabled: true,
    order: 62,
    modes: ["normal", "review"],
    sections: [{ id: "all", title: "すべて", enabled: true, order: 1 }],
  },

  // ✅ 介護用語（追加）
  {
    id: "care-terms",
    title: "介護用語（重要100）",
    description: "介護現場で必須の用語を4択で覚える",
    enabled: true,
    order: 70,
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
  // ✅ 介護リスニング（追加）
  {
    id: "care-listening",
    title: "介護リスニング（重要100）",
    description: "介護現場でよく聞く用語を聞いて意味を選ぶ",
    enabled: true,
    order: 71,
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
    order: 72,
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


  // ✅ 建設用語（分野タブ）
  {
    id: "construction-terms",
    title: "建設・現場 用語（分野別）",
    description: "説明→用語の4択で分野別に覚える（画像は補助）",
    enabled: true,
    order: 50,
    modes: ["normal", "review"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "architecture", title: "建築", enabled: true, order: 2 },
      { id: "civil", title: "土木", enabled: true, order: 3 },
      { id: "electric", title: "電気", enabled: true, order: 4 },
      { id: "hvac", title: "空調・衛生", enabled: true, order: 5 },
      { id: "plant", title: "プラント", enabled: true, order: 6 },
      { id: "management", title: "施工管理", enabled: true, order: 7 },
      { id: "tools", title: "道具", enabled: true, order: 8 },
    ],
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