// app/lib/userPlanState.ts
"use client"

import { db } from "@/app/lib/firebase"
import type { QuizType } from "@/app/data/types"
import {
  buildEntitledQuizTypes,
  normalizeSelectedForPlan,
  type PlanId,
} from "@/app/lib/plan"

import {
  Timestamp,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

export type UserPlanState = {
  plan: PlanId
  entitledQuizTypes: QuizType[]
  selectedQuizTypes: QuizType[]
  nextChangeAllowedAt: Date | null
  displayName: string
  schemaVersion: number
}

function isPlanId(v: any): v is PlanId {
  return v === "trial" || v === "free" || v === "3" || v === "5" || v === "all"
}

function coercePlanId(v: any): PlanId | null {
  // allow numeric legacy values (1/3/5)
  if (isPlanId(v)) return v
  if (typeof v === "number") {
    if (v === 1) return "trial"
    if (v === 3) return "3"
    if (v === 5) return "5"
  }
  if (typeof v === "string") {
    const s = v.trim()
    if (s === "1") return "trial"
    if (s === "3") return "3"
    if (s === "5") return "5"
  }
  return null
}

function inferPlanFromLegacy(data: any): PlanId {
  // 1) plan があれば（数値でも）解釈
  const coerced = coercePlanId(data?.plan)
  if (coerced) return coerced

  // 2) 旧 quizLimit から推定
  const limit = typeof data?.quizLimit === "number" ? (data.quizLimit as number) : null
  if (limit === 5) return "5"
  if (limit === 3) return "3"
  if (limit === 1) return "trial"

  // 3) デフォルト
  return "trial"
}

function toDateOrNull(v: any): Date | null {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v?.toDate === "function") return v.toDate()
  return null
}

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

/**
 * ✅ users/{uid} の plan/selected/lock を「読み取り + 自動修復」して返す
 *
 * - entitledQuizTypes は保存値を信用しない（plan.ts から算出）
 * - selectedQuizTypes は plan に合わせて必ず正規化（空や壊れでも詰まない）
 * - 古い entitledQuizTypes / quizLimit は削除して二重管理を根絶
 */
export async function loadAndRepairUserPlanState(uid: string): Promise<UserPlanState> {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  const data = snap.exists() ? (snap.data() as any) : {}

  const plan = inferPlanFromLegacy(data)
  const entitled = buildEntitledQuizTypes(plan)

  const rawSelected = Array.isArray(data?.selectedQuizTypes) ? (data.selectedQuizTypes as QuizType[]) : []
  const selected = normalizeSelectedForPlan(rawSelected, entitled, plan)

  const nextChangeAllowedAt = toDateOrNull(data?.nextChangeAllowedAt)
  const displayName = typeof data?.displayName === "string" ? data.displayName : ""

  const patch: Record<string, any> = {}
  let needUpdate = false

  if (data?.schemaVersion !== 2) {
    patch.schemaVersion = 2
    needUpdate = true
  }

  // plan を正規形で保存（数値->文字列など）
  if (!isPlanId(data?.plan) || data.plan !== plan) {
    patch.plan = plan
    needUpdate = true
  }

  if (JSON.stringify(rawSelected) !== JSON.stringify(selected)) {
    patch.selectedQuizTypes = selected
    needUpdate = true
  }

  // 二重管理の元凶は削除
  if (data?.entitledQuizTypes) {
    patch.entitledQuizTypes = deleteField()
    needUpdate = true
  }
  if (typeof data?.quizLimit === "number") {
    patch.quizLimit = deleteField()
    needUpdate = true
  }

  if (needUpdate) {
    patch.updatedAt = serverTimestamp()
    await setDoc(ref, patch, { merge: true })
  }

  return {
    plan,
    entitledQuizTypes: entitled,
    selectedQuizTypes: selected,
    nextChangeAllowedAt,
    displayName,
    schemaVersion: 2,
  }
}

/**
 * ✅ 教材選択の保存（1ヶ月ロック開始をここで管理）
 * - ロック開始は「今ロック中じゃない」時だけ（毎回延長しない）
 */
export async function saveSelectedQuizTypesWithLock(params: {
  uid: string
  selectedQuizTypes: QuizType[]
}): Promise<{ saved: QuizType[]; nextChangeAllowedAt: Date | null }> {
  const state = await loadAndRepairUserPlanState(params.uid)
  const normalized = normalizeSelectedForPlan(params.selectedQuizTypes, state.entitledQuizTypes, state.plan)

  const now = new Date()
  const lockedUntil = state.nextChangeAllowedAt
  const isLocked = lockedUntil ? now < lockedUntil : false
  const next = isLocked ? lockedUntil : addMonths(now, 1)

  const ref = doc(db, "users", params.uid)
  await setDoc(
    ref,
    {
      selectedQuizTypes: normalized,
      nextChangeAllowedAt: next ? Timestamp.fromDate(next) : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return { saved: normalized, nextChangeAllowedAt: next }
}

/**
 * ✅ プラン変更保存
 * - selected は plan に合わせて正規化
 * - entitledQuizTypes は保存しない（残ってても削除）
 */
export async function savePlanAndNormalizeSelected(params: {
  uid: string
  plan: PlanId
}): Promise<UserPlanState> {
  const ref = doc(db, "users", params.uid)
  const snap = await getDoc(ref)
  const data = snap.exists() ? (snap.data() as any) : {}

  const entitled = buildEntitledQuizTypes(params.plan)
  const rawSelected = Array.isArray(data?.selectedQuizTypes) ? (data.selectedQuizTypes as QuizType[]) : []
  const selected = normalizeSelectedForPlan(rawSelected, entitled, params.plan)

  await setDoc(
    ref,
    {
      plan: params.plan,
      schemaVersion: 2,
      selectedQuizTypes: selected,
      entitledQuizTypes: deleteField(),
      quizLimit: deleteField(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return {
    plan: params.plan,
    entitledQuizTypes: entitled,
    selectedQuizTypes: selected,
    nextChangeAllowedAt: toDateOrNull(data?.nextChangeAllowedAt),
    displayName: typeof data?.displayName === "string" ? data.displayName : "",
    schemaVersion: 2,
  }
}
