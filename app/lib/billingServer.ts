// app/lib/billingServer.ts
import { adminDb } from "@/app/lib/firebaseAdmin"

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

export async function setUserBillingMerge(uid: string, patch: BillingPatch) {
  const ref = adminDb().collection("users").doc(uid)
  await ref.set(
    {
      billing: patch,
      updatedAt: new Date(),
    },
    { merge: true }
  )
}
