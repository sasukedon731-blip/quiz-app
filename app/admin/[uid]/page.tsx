"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "../../lib/useAuth"
import { getUserRole, getLatestResults } from "../../lib/firestore"

type QuizResult = {
  id: string
  score: number
  total: number
  quizType?: string
  createdAt?: { seconds: number }
}

function formatDate(sec?: number) {
  if (!sec) return "-"
  return new Date(sec * 1000).toLocaleString()
}

export default function AdminUserPage() {
  const router = useRouter()
  const { uid } = useParams<{ uid: string }>()
  const { user, loading } = useAuth()
  const [results, setResults] = useState<QuizResult[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }

    const init = async () => {
      const role = await getUserRole(user.uid)
      if (role !== "admin") {
        router.replace("/")
        return
      }

      const data = await getLatestResults(uid, 50)
      setResults(data as any)
      setReady(true)
    }

    init()
  }, [user, loading, uid, router])

  if (loading || !ready) {
    return <p style={{ textAlign: "center" }}>読み込み中…</p>
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <button
        onClick={() => router.push("/admin")}
        style={{ marginBottom: 10 }}
      >
        ← 一覧に戻る
      </button>

      <h1>ユーザー詳細</h1>
      <p style={{ fontSize: 12, color: "#666" }}>UID: {uid}</p>

      {results.length === 0 ? (
        <p>結果がありません</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>教材</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>日時</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>スコア</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {r.quizType ?? "gaikoku-license"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {formatDate(r.createdAt?.seconds)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {r.score} / {r.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
