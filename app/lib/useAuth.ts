"use client"

import { useEffect, useRef, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "./firebase"
import { ensureUserProfile } from "./firestore"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 同一セッションで何度も作成処理が走らないようにガード
  const ensuredRef = useRef<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)

      if (!u) {
        ensuredRef.current = null
        return
      }

      // 既に同じuidで作成済みならスキップ
      if (ensuredRef.current === u.uid) return
      ensuredRef.current = u.uid

      // users/{uid} を必ず作る（存在するなら何もしない）
      try {
        await ensureUserProfile({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
        })
      } catch (e) {
        console.error("ensureUserProfile failed", e)
        // 失敗してもログイン自体は継続させる
      }
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
