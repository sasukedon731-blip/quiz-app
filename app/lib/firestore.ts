// app/lib/firestore.ts
"use client"

import { db } from "./firebase"
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"

export type UserRole = "admin" | "user"

export type UserProfile = {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  createdAt?: any
  updatedAt?: any
}

/**
 * ✅ users/{uid} を必ず用意する
 * - 無ければ作る
 * - あれば「足りない情報(email/displayName/uid)だけ補完」する
 * - role は絶対に変更しない（adminが消えない）
 */
export async function ensureUserProfile(params: {
  uid: string
  email?: string | null
  displayName?: string | null
}) {
  const ref = doc(db, "users", params.uid)
  const snap = await getDoc(ref)

  const email = params.email ?? null
  const displayName = params.displayName ?? null

  // --- 初回：users/{uid} が無い場合は作る ---
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: params.uid,
      email,
      displayName,
      role: "user" as UserRole, // 初期は user。あとで手動で admin にしてOK
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  // --- 既存：足りない情報だけ補完（roleは触らない） ---
  const data = snap.data() as Partial<UserProfile>
  const patch: Record<string, any> = {}

  // uidフィールドが無い場合だけ入れる（doc.idは既にuidだが、整合性のため）
  if (data.uid == null || data.uid === "") patch.uid = params.uid

  // email が空なら補完（ただし params.email がある時だけ）
  if ((data.email == null || data.email === "") && email) patch.email = email

  // displayName が空なら補完（ただし params.displayName がある時だけ）
  if ((data.displayName == null || data.displayName === "") && displayName) {
    patch.displayName = displayName
  }

  if (Object.keys(patch).length > 0) {
    patch.updatedAt = serverTimestamp()
    await updateDoc(ref, patch)
  }
}

/**
 * ✅ 管理者判定に使う：users/{uid}.role を読む
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return "user"
  const role = (snap.data() as any)?.role
  return role === "admin" ? "admin" : "user"
}
