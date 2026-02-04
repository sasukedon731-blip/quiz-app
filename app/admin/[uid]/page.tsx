"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"
import { useAuth } from "../../lib/useAuth"
import { db } from "../../lib/firebase"
import { getUserRole } from "../../lib/firestore"

type QuizResult = {
  score: number
  total: number
  mode?: string
  quizType?: string
  createdAt?: { seconds: number } | null
}

function formatDateSeconds(seconds?: number) {
  if (!seconds) return "-"
  return new Date(seconds * 1000).toLocaleString()
}

export default function AdminUserPage() {
  const router = useRouter()
  const params = useParams()
  const uid = String((params as any).uid)

  const { user, loading } = useAuth()

  const [results, setResults] = useState<QuizResult[]>([])
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
        const role = await getUserRole(user.uid)
        if (role !== "admin") {
          router.replace("/")
          return
        }

        const q = query(
          collection(db, "users", uid, "results"),
          orderBy("createdAt", "desc"),
          limit(50)
        )
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => d.data() as QuizResult)
        setResults(list)
      } catch (e: any) {
        console.error(e)
        setError(e?.code ? `${e.code}: ${e.message ?? ""}` : e?.message ?? "不明なエラー")
      } finally {
        setReady(true)
      }
    }

    init()
  }, [uid, user, loading, router])

  if (loading || !ready) return <p style={{ textAlign: "center" }}>読み込み中…</p>

  if (error) {
    return (
      <div style={{ maxWidth: 720, margin: "30px auto", padding: 16 }}>
        <h1>ユーザー詳細</h1>
        <p>UID: {uid}</p>
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #fca5a5",
            background: "#fef2f2",
            color: "#991b1b",
            fontWeight: 800,
            whiteSpace: "pre-wrap",
          }}
        >
          エラー：
          {"\n"}
          {error}
        </div>
        <button
          onClick={() => router.push("/admin")}
          style={{
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          ← 一覧に戻る
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <button
        onClick={() => router.push("/admin")}
        style={{
          marginBottom: 12,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        ← 一覧に戻る
      </button>

      <h1>ユーザー詳細</h1>
      <p style={{ fontSize: 12, color: "#666" }}>UID: {uid}</p>

      {results.length === 0 ? (
        <p>結果がありません</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>教材</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>モード</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>日時</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>スコア</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>正答率</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const acc = r.total ? Math.round((r.score / r.total) * 100) : 0
              return (
                <tr key={i}>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{r.quizType ?? "-"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{r.mode ?? "-"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {formatDateSeconds(r.createdAt?.seconds ?? undefined)}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {r.score} / {r.total}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8, fontWeight: 800 }}>{acc}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
