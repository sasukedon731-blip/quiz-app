// app/lib/billingServer.ts
import { adminDb } from "@/app/lib/firebaseAdmin"
import { buildEntitledQuizTypes, normalizeSelectedForPlan } from "@/app/lib/plan"
import type { QuizType } from "@/app/data/types"

export type BillingStatus = "pending" | "active" | "past_due" | "canceled"
export type BillingMethod = "convenience" | "card"
export type PlanId = "trial" | "free" | "3" | "5" | "all"

export type BillingPatch = Partial<{
  accountType: "personal" | "company"
  method: BillingMethod
  status: BillingStatus
  currentPlan: PlanId
  currentPeriodEnd: any
  stripeCustomerId: string | null
  stripeCheckoutSessionId: string | null
  stripePaymentIntentId: string | null
  updatedAt: any
}>

type UserDoc = {
  plan?: PlanId
  entitledQuizTypes?: QuizType[]
  selectedQuizTypes?: QuizType[]
  nextChangeAllowedAt?: any
  billing?: any
}

function isPlanId(v: any): v is PlanId {
  return v === "trial" || v === "free" || v === "3" || v === "5" || v === "all"
}

function nextMonthDate(from = new Date()) {
  const d = new Date(from)
  d.setMonth(d.getMonth() + 1)
  return d
}

/**
 * ✅ billing を merge 更新（既存の動作を維持）
 * - billing の中身は「部分更新」したい時に使う
 */
export async function patchUserBilling(uid: string, patch: BillingPatch) {
  const ref = adminDb().collection("users").doc(uid)
  await ref.set(
    {
      billing: {
        ...patch,
      },
      updatedAt: new Date(),
    },
    { merge: true }
  )
}

/**
 * ✅ webhook から呼ばれるメイン
 * - billing を merge
 * - さらに status=active & currentPlan が来た場合は
 *   entitled/selected/nextChangeAllowedAt を確定
 */
export async function setUserBillingMerge(uid: string, patch: BillingPatch) {
  const ref = adminDb().collection("users").doc(uid)

  // selected を壊さないために現状取得
  const snap = await ref.get()
  const current = (snap.exists ? (snap.data() as UserDoc) : {}) as UserDoc

  const next: any = {
    billing: patch,
    updatedAt: new Date(),
  }

  const becomingActive = patch.status === "active"
  const nextPlan = patch.currentPlan

  // ✅ 有料プラン確定時に entitlements を確定させる
  if (
    becomingActive &&
    isPlanId(nextPlan) &&
    (nextPlan === "3" || nextPlan === "5" || nextPlan === "all")
  ) {
    const entitled = buildEntitledQuizTypes(nextPlan)

    // ✅ 引数順は (selected, entitled, plan)
    const selected = normalizeSelectedForPlan(
      (current.selectedQuizTypes ?? []) as QuizType[],
      entitled,
      nextPlan
    )

    next.entitledQuizTypes = entitled
    next.selectedQuizTypes = selected
    next.nextChangeAllowedAt = nextMonthDate()

    // 任意：旧互換で plan も揃える（あなたの設計では billing.currentPlan が優先なので必須ではない）
    next.plan = nextPlan
  }

  await ref.set(next, { merge: true })
}