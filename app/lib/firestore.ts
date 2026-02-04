// app/lib/firestore.ts
// Firestore 操作ユーティリティ（Firebase初期化はしない！）

import { db } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

// ✅ 互換のため export（既存の import { db } from "../lib/firestore" を壊さない）
export { db }

// --------------------
// Types
// --------------------
export type UserRole = "admin" | "user"

export type UserProfile = {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  createdAt?: any
}

export type QuizResultDoc = {
  score: number
  total: number
  createdAt: { seconds: number } | null
  quizType?: string
  mode?: string
  // 他にも保存している項目があれば追加してOK（互換のため）
  [k: string]: any
}

// --------------------
// User profile / role
// --------------------

/**
 * users/{uid} が無ければ作成する（roleは user）
 * ※ admin判定をFirestore roleで行うための土台
 */
export async function ensureUserProfile(params: {
  uid: string
  email?: string | null
  displayName?: string | null
}) {
  const ref = doc(db, "users", params.uid)
  const snap = await getDoc(ref)

  if (snap.exists()) return

  const payload: UserProfile = {
    uid: params.uid,
    email: params.email ?? null,
    displayName: params.displayName ?? null,
    role: "user",
    createdAt: serverTimestamp(),
  }

  await setDoc(ref, payload)
}

/**
 * users/{uid}.role を取得（無ければ user）
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return "user"

  const role = snap.data()?.role
  return role === "admin" ? "admin" : "user"
}

/**
 * users/{uid} のプロフィール取得（無ければ null）
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

// --------------------
// Results (exam etc.)
// --------------------

/**
 * users/{uid}/results 最新 n 件を取得
 * （mypage でも admin でも再利用できる）
 */
export async function getLatestResults(uid: string, n = 50) {
  const q = query(
    collection(db, "users", uid, "results"),
    orderBy("createdAt", "desc"),
    limit(n)
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as QuizResultDoc),
  }))
}
