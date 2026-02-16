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


export type BillingStatus = "pending" | "active" | "past_due" | "canceled"
export type BillingMethod = "convenience" | "card" | "bank_transfer"
export type AccountType = "personal" | "company"

/**
 * ✅ 後方互換：billing が無い既存ユーザーは active とみなす（移行で壊さない）
 */
export function getBillingStatus(userDoc: any): BillingStatus {
  const s = userDoc?.billing?.status
  if (s === "pending" || s === "active" || s === "past_due" || s === "canceled") return s
  return "active"
}

export function isAccessActive(userDoc: any): boolean {
  if (getBillingStatus(userDoc) !== "active") return false

  // ✅ 期限がある場合は期限も見る（都度払い / まとめ払い対応）
  const end = userDoc?.billing?.currentPeriodEnd
  if (!end) return true // 旧ユーザー互換（期限未導入でも壊さない）

  try {
    const endDate = typeof end?.toDate === "function" ? end.toDate() : new Date(end)
    return endDate.getTime() > Date.now()
  } catch {
    return false
  }
}


/**
 * ✅ plan は billing.currentPlan を優先（無ければ従来 plan）
 */
export function getEffectivePlanId(userDoc: any): PlanId {
  const p = userDoc?.billing?.currentPlan ?? userDoc?.plan
  return (p === "trial" || p === "free" || p === "3" || p === "5" || p === "all") ? p : "trial"
}
