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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/login")
      return
    }

    const init = async () => {
      setError(null)
      setReady(false)

      try {
        // ① 自分の users/{uid} を保証（なければ作る）
        await ensureUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        })

        // ② admin 判定（自分の users/{uid}.role を見る）
        const role = await getUserRole(user.uid)
        if (role !== "admin") {
          router.replace("/")
          return
        }

        // ③ ユーザー一覧取得（ここが Rules に引っかかりやすい）
        const snap = await getDocs(collection(db, "users"))
        const list = snap.docs.map((d) => d.data() as UserDoc)
        setUsers(list)
      } catch (e: any) {
        console.error(e)
        setError(
          e?.code
            ? `${e.code}: ${e.message ?? ""}`
            : e?.message ?? "不明なエラー"
        )
      } finally {
        // ✅ ここが無いと「読み込み中」固定になる
        setReady(true)
      }
    }

    init()
  }, [user, loading, router])

  if (loading || !ready) {
    return <p style={{ textAlign: "center" }}>読み込み中…</p>
  }

  if (error) {
    return (
      <div style={{ maxWidth: 720, margin: "30px auto", padding: 16 }}>
        <h1>管理者ページ</h1>
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #fca5a5",
            background: "#fef2f2",
            color: "#991b1b",
            fontWeight: 700,
            whiteSpace: "pre-wrap",
          }}
        >
          エラーが発生しました：
          {"\n"}
          {error}
          {"\n\n"}
          ✅ 多い原因：Firestore Security Rules で users 一覧の read が許可されていません
        </div>

        <button
          onClick={() => router.push("/")}
          style={{
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          TOPへ戻る
        </button>
      </div>
    )
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
          {users.map((u) => (
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
                    background: "#fff",
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
