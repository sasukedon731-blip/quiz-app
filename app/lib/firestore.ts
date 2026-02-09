// app/lib/firestore.ts
"use client"

import { db } from "@/app/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

export type UserRole = "admin" | "user"

type EnsureParams = {
  uid: string
  email?: string | null
  displayName?: string | null
}

/**
 * ✅ users/{uid} を必ず「実在するドキュメント」として作る/補正する
 * - 初回：role/user を含めて作成（空ドキュメント問題を根絶）
 * - 既存：roleは触らず、email/displayName/updatedAt を安全に merge
 * - Phase1：quizLimit / selectedQuizTypes を初期化（未設定なら後で入るが、初回で確実に）
 */
export async function ensureUserProfile(params: EnsureParams) {
  const { uid } = params
  const email = params.email ?? null
  const displayName = params.displayName ?? null

  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email,
      displayName,
      role: "user" as UserRole,

      // ✅ Phase1：受講枠（まずは個人用）
      quizLimit: 3,
      selectedQuizTypes: [],

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  // ✅ 既存：roleは変更しない（事故防止）
  // email/displayName は未設定なら補完してOK
  await setDoc(
    ref,
    {
      uid,
      ...(email ? { email } : {}),
      ...(displayName ? { displayName } : {}),

      // ✅ Phase1：既存ユーザーでも値が無いことがあるので保険で入れる
      // mergeなので既存にあれば上書きされない
      quizLimit: 3,
      selectedQuizTypes: [],

      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

/**
 * ✅ 自分のrole取得（存在しない場合は user 扱い）
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return "user"
  const role = (snap.data() as any)?.role
  return role === "admin" ? "admin" : "user"
}
