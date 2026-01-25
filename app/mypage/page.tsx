"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "../lib/firebase"
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore"
import { db } from "../lib/firestore"

type QuizResult = {
  score: number
  total: number
  createdAt: { seconds: number } | null
}

export default function MyPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)

  /* 🔐 ログインチェック */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) router.replace("/login")
      else setUser(u)
    })
    return () => unsub()
  }, [router])

  /* 📊 過去5件取得 */
  useEffect(() => {
    if (!user) return

    const fetchResults = async () => {
      setLoading(true)
      try {
        const q = query(
          collection(db, "users", user.uid, "results"),
          orderBy("createdAt", "desc"),
          limit(5)
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map(d => d.data() as QuizResult)

        // グラフ用に古い → 新しい
        setResults(data.reverse())
      } catch (e) {
        console.error("結果取得失敗", e)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [user])

  /* 🚪 ログアウト */
  const handleLogout = async () => {
    await signOut(auth)
    router.replace("/login")
  }

  const hasResults = results.length > 0

  /* ===== グラフ計算（結果があるときのみ）===== */
  const graphWidth = 320
  const graphHeight = 160
  const maxScore = hasResults
    ? Math.max(...results.map(r => r.total))
    : 20

  const points = hasResults
    ? results
        .map((r, i) => {
          const x =
            results.length === 1
              ? graphWidth / 2
              : (graphWidth / (results.length - 1)) * i
          const y = graphHeight - (r.score / maxScore) * graphHeight
          return `${x},${y}`
        })
        .join(" ")
    : ""

  if (!user) return <p style={{ textAlign: "center" }}>確認中...</p>

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto", textAlign: "center" }}>
      <h1>マイページ</h1>
      <p>ようこそ {user.displayName ?? user.email} さん</p>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => router.push("/")}
          style={{
            margin: "10px",
            padding: "8px 12px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          TOPに戻る
        </button>

        <button
          onClick={handleLogout}
          style={{
            margin: "10px",
            padding: "8px 12px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#f44336",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          ログアウト
        </button>
      </div>

      <h2>過去の結果（最新5件）</h2>

      {loading ? (
        <p>読み込み中…</p>
      ) : results.length === 0 ? (
        <p>まだ結果がありません</p>
      ) : (
        <>
          {/* 📄 表 */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px"
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  日付
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  スコア
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {r.createdAt
                      ? new Date(
                          r.createdAt.seconds * 1000
                        ).toLocaleString()
                      : "-"}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {r.score} / {r.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 📈 グラフ */}
          <h3 style={{ marginTop: 30 }}>得点推移</h3>
          <svg width={graphWidth} height={graphHeight}>
            <polyline
              fill="none"
              stroke="#4caf50"
              strokeWidth="3"
              points={points}
            />
            {results.map((r, i) => {
              const x =
                results.length === 1
                  ? graphWidth / 2
                  : (graphWidth / (results.length - 1)) * i
              const y =
                graphHeight - (r.score / maxScore) * graphHeight
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#4caf50"
                />
              )
            })}
          </svg>
        </>
      )}
    </div>
  )
}
