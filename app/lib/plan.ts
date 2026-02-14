// app/lib/plan.ts
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"

export type PlanId = "trial" | "free" | "3" | "5" | "all"
export type SelectLimit = number | "ALL"

export function getSelectLimit(plan: PlanId): SelectLimit {
  if (plan === "trial" || plan === "free") return 1
  if (plan === "3") return 3
  if (plan === "5") return 5
  return "ALL"
}

/**
 * ✅ entitled（候補）は「quizzesのキー」を採用（ズレ事故を根絶）
 */
export function buildEntitledQuizTypes(plan: PlanId): QuizType[] {
  const all = Object.keys(quizzes) as QuizType[]
  // trial/free は固定1教材（先頭固定 or gaikoku固定にしたいならここで指定）
  if (plan === "trial" || plan === "free") return all.slice(0, 1)
  return all
}

/**
 * ✅ selected を plan に合わせて正規化
 * - trial/free: 1つ固定
 * - 3/5: 上限までに丸める（足りなければ先頭から補完）
 * - all: 空なら全件
 */
export function normalizeSelectedForPlan(
  selected: QuizType[],
  entitled: QuizType[],
  plan: PlanId
): QuizType[] {
  const uniq = Array.from(new Set(selected)).filter((q) => entitled.includes(q))

  const limit = getSelectLimit(plan)
  if (plan === "all") {
    return uniq.length > 0 ? uniq : [...entitled]
  }

  const n = limit === "ALL" ? entitled.length : limit

  // trial/free
  if (n <= 1) {
    return entitled.length ? [entitled[0]] : []
  }

  // 上限まで切る
  const trimmed = uniq.slice(0, n)

  // 足りない分は entitled の先頭から補完
  if (trimmed.length < n) {
    for (const q of entitled) {
      if (trimmed.length >= n) break
      if (!trimmed.includes(q)) trimmed.push(q)
    }
  }

  return trimmed
}
