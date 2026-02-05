// app/lib/firestore.ts
"use client"

import { db } from "./firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

export type UserRole = "admin" | "user"

export async function ensureUserProfile(params: {
  uid: string
  email?: string | null
  displayName?: string | null
}) {
  const ref = doc(db, "users", params.uid)
  const snap = await getDoc(ref)

  const email = params.email ?? null
  const displayName = params.displayName ?? null

  if (!snap.exists()) {
    // 初回作成（roleは user で作る。後から手動で admin にしてOK）
    await setDoc(ref, {
      uid: params.uid,
      email,
      displayName,
      role: "user" as UserRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  // 既存：role は触らず、email/displayName を「merge」で追記/更新する
  // ※ これなら、以前 role だけ入れていたドキュメントにも確実に入る
  await setDoc(
    ref,
    {
      uid: params.uid,
      ...(email ? { email } : {}),
      ...(displayName ? { displayName } : {}),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function getUserRole(uid: string): Promise<UserRole> {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return "user"
  const role = (snap.data() as any)?.role
  return role === "admin" ? "admin" : "user"
}
