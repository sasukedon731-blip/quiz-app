// app/lib/plan.ts
import type { QuizType } from "@/app/data/types"
import { quizzes } from "@/app/data/quizzes"

export type PlanId = "trial" | "free" | "3" | "5" | "all"

export function getAllQuizTypes(): QuizType[] {
  return Object.keys(quizzes) as QuizType[]
}

/**
 * entitledQuizTypes = 「候補（選べる一覧）」
 * - trial/free: 固定1教材のみ（お試し）
 * - 3/5: 全教材を候補にする（選ぶ数は selected で制御）
 * - all: 全教材
 */
export function buildEntitledQuizTypes(plan: PlanId): QuizType[] {
  const all = getAllQuizTypes()
  const trialOne: QuizType = "gaikoku-license"

  if (plan === "trial" || plan === "free") return [trialOne]
  if (plan === "3" || plan === "5" || plan === "all") return all

  return [trialOne]
}

/**
 * selectedQuizTypes = 「今月使う教材」
 * - trial/free: 1つ固定
 * - 3/5: 選択数を上限に収める（空なら先頭から埋める）
 * - all: 空なら entitled 全部でもOK（運用次第）
 */
export function normalizeSelectedForPlan(
  selected: QuizType[],
  entitled: QuizType[],
  plan: PlanId
): QuizType[] {
  const filtered = selected.filter((q) => entitled.includes(q))

  if (plan === "all") {
    // allは「選ばせない」運用なら空でもOKだが、
    // 画面表示のために空なら全件にしておくと楽
    return filtered.length ? filtered : entitled
  }

  const limit = plan === "3" ? 3 : plan === "5" ? 5 : 1
  const sliced = filtered.slice(0, limit)
  return sliced.length ? sliced : entitled.slice(0, limit)
}

/**
 * 上限数（UI表示用）
 */
export function getSelectLimit(plan: PlanId): number | "ALL" {
  if (plan === "all") return "ALL"
  if (plan === "3") return 3
  if (plan === "5") return 5
  return 1 // trial/free
}
