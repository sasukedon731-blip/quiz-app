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
  entitledQuizTypes: QuizType[] // 候補（plan.tsから算出）
  selectedQuizTypes: QuizType[] // 今月の受講教材（Firestoreにはこれだけを保存）
  nextChangeAllowedAt: Date | null // 教材変更ロック解除日
  displayName: string
  schemaVersion: number
}

function isPlanId(v: any): v is PlanId {
  return v === "trial" || v === "free" || v === "3" || v === "5" || v === "all"
}

function inferPlanFromLegacy(data: any): PlanId {
  // 1) 新しい plan があれば採用
  if (isPlanId(data?.plan)) return data.plan

  // 2) 旧 quizLimit から推定（既存ユーザー救済）
  const limit = typeof data?.quizLimit === "number" ? (data.quizLimit as number) : null
  if (limit === 5) return "5"
  if (limit === 3) return "3"
  if (limit === 1) return "trial"

  // 3) 不明なら安全側
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

  const rawSelected = Array.isArray(data?.selectedQuizTypes)
    ? (data.selectedQuizTypes as QuizType[])
    : []

  const selected = normalizeSelectedForPlan(rawSelected, entitled, plan)

  const nextChangeAllowedAt = toDateOrNull(data?.nextChangeAllowedAt)
  const displayName = typeof data?.displayName === "string" ? data.displayName : ""

  // ---- 自動修復パッチ ----
  const patch: Record<string, any> = {}
  let needUpdate = false

  if (data?.schemaVersion !== 2) {
    patch.schemaVersion = 2
    needUpdate = true
  }

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
 *
 * 仕様：
 * - trial/free: 常に固定1教材（保存内容も正規化）
 * - 3/5: 選択数を上限に正規化して保存
 * - all: 空なら全件に正規化して保存
 * - ロック開始は「今ロック中じゃない」時だけ（毎回延長しない）
 */
export async function saveSelectedQuizTypesWithLock(params: {
  uid: string
  selectedQuizTypes: QuizType[]
}): Promise<{ saved: QuizType[]; nextChangeAllowedAt: Date | null }> {
  const { uid } = params
  const state = await loadAndRepairUserPlanState(uid)

  const entitled = state.entitledQuizTypes
  const normalized = normalizeSelectedForPlan(
    params.selectedQuizTypes,
    entitled,
    state.plan
  )

  const now = new Date()
  const lockedUntil = state.nextChangeAllowedAt
  const isLocked = lockedUntil ? now < lockedUntil : false

  // ✅ ロック開始は「ロック中じゃない」場合のみ
  const next = isLocked ? lockedUntil : addMonths(now, 1)

  const ref = doc(db, "users", uid)
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
 * ✅ プラン変更保存（plan.ts を唯一のルール源にする）
 *
 * - plan変更後、selected は plan に合わせて正規化
 * - entitledQuizTypes は保存しない（残ってたら削除）
 */
export async function savePlanAndNormalizeSelected(params: {
  uid: string
  plan: PlanId
}): Promise<UserPlanState> {
  const { uid, plan } = params

  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  const data = snap.exists() ? (snap.data() as any) : {}

  const entitled = buildEntitledQuizTypes(plan)

  const rawSelected = Array.isArray(data?.selectedQuizTypes)
    ? (data.selectedQuizTypes as QuizType[])
    : []

  const selected = normalizeSelectedForPlan(rawSelected, entitled, plan)

  await setDoc(
    ref,
    {
      plan,
      schemaVersion: 2,
      selectedQuizTypes: selected,
      entitledQuizTypes: deleteField(),
      quizLimit: deleteField(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return {
    plan,
    entitledQuizTypes: entitled,
    selectedQuizTypes: selected,
    nextChangeAllowedAt: toDateOrNull(data?.nextChangeAllowedAt),
    displayName: typeof data?.displayName === "string" ? data.displayName : "",
    schemaVersion: 2,
  }
}
