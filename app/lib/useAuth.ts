// app/lib/useAuth.ts
"use client"

import { useEffect, useRef, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "./firebase"
import { ensureUserProfile } from "./firestore"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 同じ uid で何度も ensure が走らないようにする
  const ensuredUidRef = useRef<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)

      if (!u) {
        ensuredUidRef.current = null
        return
      }

      if (ensuredUidRef.current === u.uid) return
      ensuredUidRef.current = u.uid

      try {
        await ensureUserProfile({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
        })
      } catch (e) {
        console.error("ensureUserProfile failed", e)
        // ログイン自体は止めない
      }
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
