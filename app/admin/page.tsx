"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuth } from "../lib/useAuth"
import { getUserRole, ensureUserProfile } from "../lib/firestore"

type UserDoc = {
  uid: string
  email?: string | null
  displayName?: string | null
  role?: "admin" | "user"
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [users, setUsers] = useState<UserDoc[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }

    const init = async () => {
      // 自分の users/{uid} を保証
      await ensureUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      })

      // admin チェック
      const role = await getUserRole(user.uid)
      if (role !== "admin") {
        router.replace("/")
        return
      }

      // ユーザー一覧取得
      const snap = await getDocs(collection(db, "users"))
      const list = snap.docs.map(d => d.data() as UserDoc)
      setUsers(list)
      setReady(true)
    }

    init()
  }, [user, loading, router])

  if (loading || !ready) {
    return <p style={{ textAlign: "center" }}>読み込み中…</p>
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <h1>管理者ページ</h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>名前</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>メール</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>UID</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.uid}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {u.displayName ?? "-"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {u.email ?? "-"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8, fontSize: 12 }}>
                {u.uid}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                <button
                  onClick={() => router.push(`/admin/${u.uid}`)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  詳細
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
