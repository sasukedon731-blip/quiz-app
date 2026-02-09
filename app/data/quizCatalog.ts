// app/data/quizCatalog.ts

export type QuizMode = "normal" | "exam" | "review"

export type QuizSectionDef = {
  id: string // all / grammar / sign など
  title: string // 表示名
  description?: string
  enabled: boolean
  order: number
}

export type QuizDef = {
  id: string // quizType（URLやFirestoreで使う）
  title: string
  description?: string

  enabled: boolean
  order: number

  modes: QuizMode[]
  sections: QuizSectionDef[]
}

/**
 * 🎯 全教材共通のカタログ
 * - 今は全て section = all のみ
 * - 将来ここに section を足すだけ
 */
export const quizCatalog: QuizDef[] = [
  {
    id: "gaikoku-license",
    title: "外国免許切替",
    description: "日本の交通ルール・標識・優先関係",
    enabled: true,
    order: 1,
    modes: ["normal", "exam", "review"],
    sections: [
      {
        id: "all",
        title: "総合",
        enabled: true,
        order: 1,
      },
      // 将来用（まだ非公開）
      // { id: "sign", title: "標識", enabled: false, order: 2 },
      // { id: "rule", title: "交通ルール", enabled: false, order: 3 },
    ],
  },

  {
    id: "japanese-n4",
    title: "日本語検定 N4",
    description: "文法・語彙・読解・聴解",
    enabled: true,
    order: 2,
    modes: ["normal", "exam", "review"],
    sections: [
      {
        id: "all",
        title: "総合",
        enabled: true,
        order: 1,
      },
      // 将来用
      // { id: "grammar", title: "文法", enabled: false, order: 2 },
      // { id: "vocab", title: "語彙", enabled: false, order: 3 },
      // { id: "reading", title: "読解", enabled: false, order: 4 },
    ],
  },

  {
    id: "genba-listening",
    title: "現場用語リスニング",
    description: "建設・製造の現場用語",
    enabled: true,
    order: 3,
    modes: ["normal", "review"],
    sections: [
      {
        id: "all",
        title: "総合",
        enabled: true,
        order: 1,
      },
      // 将来用
      // { id: "basic", title: "基本用語", enabled: false, order: 2 },
      // { id: "safety", title: "安全指示", enabled: false, order: 3 },
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
export function resolveSection(quiz: QuizDef, sectionId?: string | null): QuizSectionDef {
  const enabledSections = (quiz.sections ?? []).filter((s) => s.enabled).sort((a, b) => a.order - b.order)

  // 最低1つは必要。もし空なら「all」を仮で返す（保険）
  const fallback: QuizSectionDef =
    enabledSections[0] ??
    {
      id: "all",
      title: "総合",
      enabled: true,
      order: 1,
    }

  if (!sectionId) return fallback
  return enabledSections.find((s) => s.id === sectionId) ?? fallback
}
