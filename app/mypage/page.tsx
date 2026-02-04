"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "../lib/firebase"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "../lib/firestore"

type QuizResult = {
  score: number
  total: number
  createdAt: { seconds: number } | null
  quizType?: string
  mode?: string
}

type TabKey = "all" | "gaikoku-license" | "japanese-n4"

const TAB_LABEL: Record<TabKey, string> = {
  all: "すべて",
  "gaikoku-license": "外国免許切替",
  "japanese-n4": "日本語検定N4",
}

type StudyProgress = {
  totalSessions: number
  todaySessions: number
  lastStudyDate: string
}

const QUIZ_TYPES = ["gaikoku-license", "japanese-n4"] as const

function typeBadge(type: string) {
  if (type === "japanese-n4") {
    return { text: "日本語検定N4", bg: "#ede9fe", fg: "#5b21b6" } // purple
  }
  // デフォルト：外国免許
  return { text: "外国免許切替", bg: "#dbeafe", fg: "#1d4ed8" } // blue
}

function formatDateSeconds(seconds: number) {
  return new Date(seconds * 1000).toLocaleString()
}

function todayKey() {
  // JSTでも概ねOK。厳密にJSTにしたければ後で調整可
  return new Date().toISOString().slice(0, 10)
}

function readStudyProgress(quizType: string): StudyProgress {
  try {
    const raw = localStorage.getItem(`study-progress-${quizType}`)
    if (!raw) {
      return { totalSessions: 0, todaySessions: 0, lastStudyDate: todayKey() }
    }
    const d = JSON.parse(raw) as Partial<StudyProgress>
    const totalSessions = typeof d.totalSessions === "number" ? d.totalSessions : 0
    const todaySessions = typeof d.todaySessions === "number" ? d.todaySessions : 0
    const lastStudyDate = typeof d.lastStudyDate === "string" ? d.lastStudyDate : todayKey()

    // 日付が古い場合、表示上は todaySessions を 0 に見せる（保存は触らない）
    if (lastStudyDate !== todayKey()) {
      return { totalSessions, todaySessions: 0, lastStudyDate }
    }
    return { totalSessions, todaySessions, lastStudyDate }
  } catch {
    return { totalSessions: 0, todaySessions: 0, lastStudyDate: todayKey() }
  }
}

export default function MyPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ タブ
  const [tab, setTab] = useState<TabKey>("all")

  // ✅ 学習進捗（localStorage）
  const [progress, setProgress] = useState<Record<string, StudyProgress>>({})

  /* 🔐 ログインチェック */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login")
      else setUser(u)
    })
    return () => unsub()
  }, [router])

  /* ✅ 学習進捗読み込み（マイページ表示時） */
  useEffect(() => {
    // client component なので基本不要だが、安全に
    if (typeof window === "undefined") return

    const p: Record<string, StudyProgress> = {}
    for (const t of QUIZ_TYPES) {
      p[t] = readStudyProgress(t)
    }
    setProgress(p)
  }, [])

  /* 📊 過去結果取得（最新50件） */
  useEffect(() => {
    if (!user) return

    const fetchResults = async () => {
      setLoading(true)
      try {
        const q = query(
          collection(db, "users", user.uid, "results"),
          orderBy("createdAt", "desc"),
          limit(50)
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((d) => d.data() as QuizResult)
        setResults(data.reverse()) // 古い→新しい
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

  // ✅ 互換：quizType が無い過去データは外国免許扱い
  const normalizedResults = useMemo(() => {
    return results.map((r) => ({
      ...r,
      quizType: r.quizType ?? "gaikoku-license",
    }))
  }, [results])

  // ✅ タブでフィルター
  const filtered = useMemo(() => {
    if (tab === "all") return normalizedResults
    return normalizedResults.filter((r) => r.quizType === tab)
  }, [normalizedResults, tab])

  // ✅ 表示は最新5件
  const displayResults = useMemo(() => {
    return filtered.slice(Math.max(0, filtered.length - 5))
  }, [filtered])

  const hasResults = displayResults.length > 0

  // ✅ グラフは正答率(%)で統一
  const accuracies = useMemo(() => {
    return displayResults.map((r) => (r.total ? Math.round((r.score / r.total) * 100) : 0))
  }, [displayResults])

  /* ===== グラフ計算 ===== */
  const graphWidth = 320
  const graphHeight = 160

  const points = hasResults
    ? accuracies
        .map((p, i) => {
          const x =
            accuracies.length === 1
              ? graphWidth / 2
              : (graphWidth / (accuracies.length - 1)) * i
          const y = graphHeight - (p / 100) * graphHeight
          return `${x},${y}`
        })
        .join(" ")
    : ""

  // ✅ 学習回数の表示用
  const todayTotal =
    (progress["gaikoku-license"]?.todaySessions ?? 0) +
    (progress["japanese-n4"]?.todaySessions ?? 0)

  const allTotal =
    (progress["gaikoku-license"]?.totalSessions ?? 0) +
    (progress["japanese-n4"]?.totalSessions ?? 0)

  if (!user) return <p style={{ textAlign: "center" }}>確認中...</p>

  return (
    <div style={{ maxWidth: "680px", margin: "30px auto", textAlign: "center" }}>
      <h1>マイページ</h1>
      <p>ようこそ {user.displayName ?? user.email} さん</p>

      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => router.push("/")}
          style={{
            margin: "10px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          TOPに戻る
        </button>

        <button
          onClick={handleLogout}
          style={{
            margin: "10px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#f44336",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ログアウト
        </button>
      </div>

      {/* ✅ 学習進捗（localStorage） */}
      <div
        style={{
          margin: "18px 0",
          padding: "14px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          textAlign: "left",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: "10px" }}>学習進捗（標準問題）</h2>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div
            style={{
              flex: "1 1 220px",
              padding: "12px",
              border: "1px solid #eee",
              borderRadius: "10px",
              background: "#fafafa",
            }}
          >
            <div style={{ fontSize: 12, color: "#666" }}>今日の学習回数（合計）</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{todayTotal} 回</div>
            <div style={{ fontSize: 12, color: "#777" }}>（外国免許 + N4）</div>
          </div>

          <div
            style={{
              flex: "1 1 220px",
              padding: "12px",
              border: "1px solid #eee",
              borderRadius: "10px",
              background: "#fafafa",
            }}
          >
            <div style={{ fontSize: 12, color: "#666" }}>累計の学習回数（合計）</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{allTotal} 回</div>
            <div style={{ fontSize: 12, color: "#777" }}>（外国免許 + N4）</div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {QUIZ_TYPES.map((t) => {
            const badge = typeBadge(t)
            const p = progress[t] ?? { totalSessions: 0, todaySessions: 0, lastStudyDate: todayKey() }
            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  border: "1px solid #eee",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      backgroundColor: badge.bg,
                      color: badge.fg,
                      fontWeight: 900,
                      fontSize: 12,
                      marginRight: 10,
                    }}
                  >
                    {badge.text}
                  </span>
                  <span style={{ fontSize: 12, color: "#666" }}>
                    今日：<b>{p.todaySessions}</b> 回 / 累計：<b>{p.totalSessions}</b> 回
                  </span>
                </div>

                <button
                  onClick={() => router.push(`/select-mode?type=${t}`)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  続きから
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
          ※ この「学習回数」は標準問題の利用回数をカウントします（模擬試験の結果とは別）
        </p>
      </div>

      {/* ✅ 教材タブ（模擬試験の履歴・グラフ） */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        {(["all", "gaikoku-license", "japanese-n4"] as TabKey[]).map((k) => {
          const active = tab === k
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: active ? "2px solid #111" : "1px solid #ccc",
                backgroundColor: active ? "#111" : "#fff",
                color: active ? "#fff" : "#111",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {TAB_LABEL[k]}
            </button>
          )
        })}
      </div>

      <h2>過去の結果（最新5件）</h2>

      {loading ? (
        <p>読み込み中…</p>
      ) : filtered.length === 0 ? (
        <p>まだ結果がありません</p>
      ) : (
        <>
          {/* 📄 表 */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>教材</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>日付</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>スコア</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>正答率</th>
              </tr>
            </thead>
            <tbody>
              {displayResults.map((r, i) => {
                const qt = r.quizType ?? "gaikoku-license"
                const badge = typeBadge(qt)
                const acc = r.total ? Math.round((r.score / r.total) * 100) : 0

                return (
                  <tr key={i}>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          backgroundColor: badge.bg,
                          color: badge.fg,
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        {badge.text}
                      </span>
                    </td>

                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {r.createdAt ? formatDateSeconds(r.createdAt.seconds) : "-"}
                    </td>

                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {r.score} / {r.total}
                    </td>

                    <td style={{ border: "1px solid #ccc", padding: "8px", fontWeight: 800 }}>
                      {acc}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* 📈 グラフ（正答率%推移） */}
          <h3 style={{ marginTop: 30 }}>正答率 推移（%）</h3>

          <svg width={graphWidth} height={graphHeight} style={{ marginTop: "8px" }}>
            {[0, 25, 50, 75, 100].map((p) => {
              const y = graphHeight - (p / 100) * graphHeight
              return (
                <g key={p}>
                  <line x1={0} y1={y} x2={graphWidth} y2={y} stroke="#eee" />
                  <text x={0} y={y - 2} fontSize="10" fill="#999">
                    {p}%
                  </text>
                </g>
              )
            })}

            <polyline fill="none" stroke="#111" strokeWidth="3" points={points} />

            {accuracies.map((p, i) => {
              const x =
                accuracies.length === 1
                  ? graphWidth / 2
                  : (graphWidth / (accuracies.length - 1)) * i
              const y = graphHeight - (p / 100) * graphHeight
              return <circle key={i} cx={x} cy={y} r="4" fill="#111" />
            })}
          </svg>

          <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            ※ 教材や問題数が違っても比較しやすいよう、グラフは「正答率(%)」で表示しています
          </p>
        </>
      )}
    </div>
  )
}
