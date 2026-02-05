"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "../lib/firebase"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "../lib/firebase"

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
  streak: number
  streakUpdatedDate: string
  bestStreak: number
}

const QUIZ_TYPES = ["gaikoku-license", "japanese-n4"] as const

function typeBadge(type: string) {
  if (type === "japanese-n4") {
    return { text: "日本語検定N4", bg: "#ede9fe", fg: "#5b21b6" }
  }
  return { text: "外国免許切替", bg: "#dbeafe", fg: "#1d4ed8" }
}

function formatDateSeconds(seconds: number) {
  return new Date(seconds * 1000).toLocaleString()
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function readStudyProgress(quizType: string): StudyProgress {
  const today = todayKey()
  const base: StudyProgress = {
    totalSessions: 0,
    todaySessions: 0,
    lastStudyDate: today,
    streak: 0,
    streakUpdatedDate: "",
    bestStreak: 0,
  }

  try {
    const raw = localStorage.getItem(`study-progress-${quizType}`)
    if (!raw) return base
    const d = JSON.parse(raw) as Partial<StudyProgress>

    const p: StudyProgress = {
      totalSessions: typeof d.totalSessions === "number" ? d.totalSessions : 0,
      todaySessions: typeof d.todaySessions === "number" ? d.todaySessions : 0,
      lastStudyDate: typeof d.lastStudyDate === "string" ? d.lastStudyDate : today,
      streak: typeof d.streak === "number" ? d.streak : 0,
      streakUpdatedDate: typeof d.streakUpdatedDate === "string" ? d.streakUpdatedDate : "",
      bestStreak: typeof d.bestStreak === "number" ? d.bestStreak : 0,
    }

    // 日付が違えば、表示上の todaySessions は 0 扱い
    if (p.lastStudyDate !== today) {
      return { ...p, todaySessions: 0 }
    }
    return p
  } catch {
    return base
  }
}

export default function MyPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)

  const [tab, setTab] = useState<TabKey>("all")
  const [progress, setProgress] = useState<Record<string, StudyProgress>>({})

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login")
      else setUser(u)
    })
    return () => unsub()
  }, [router])

  // 学習進捗読み込み
  useEffect(() => {
    if (typeof window === "undefined") return
    const p: Record<string, StudyProgress> = {}
    for (const t of QUIZ_TYPES) p[t] = readStudyProgress(t)
    setProgress(p)
  }, [])

  // 結果取得
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
        setResults(data.reverse())
      } catch (e) {
        console.error("結果取得失敗", e)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    router.replace("/login")
  }

  // 互換：quizTypeが無いなら外国免許扱い
  const normalizedResults = useMemo(() => {
    return results.map((r) => ({
      ...r,
      quizType: r.quizType ?? "gaikoku-license",
    }))
  }, [results])

  const filtered = useMemo(() => {
    if (tab === "all") return normalizedResults
    return normalizedResults.filter((r) => r.quizType === tab)
  }, [normalizedResults, tab])

  const displayResults = useMemo(() => {
    return filtered.slice(Math.max(0, filtered.length - 5))
  }, [filtered])

  const accuracies = useMemo(() => {
    return displayResults.map((r) => (r.total ? Math.round((r.score / r.total) * 100) : 0))
  }, [displayResults])

  const graphWidth = 320
  const graphHeight = 160
  const points =
    accuracies.length > 0
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

  // 学習回数・streakまとめ
  const pG = progress["gaikoku-license"] ?? {
    totalSessions: 0,
    todaySessions: 0,
    lastStudyDate: todayKey(),
    streak: 0,
    streakUpdatedDate: "",
    bestStreak: 0,
  }
  const pN = progress["japanese-n4"] ?? pG

  const todayTotal = (pG.todaySessions ?? 0) + (pN.todaySessions ?? 0)
  const allTotal = (pG.totalSessions ?? 0) + (pN.totalSessions ?? 0)

  const bestStreak = Math.max(pG.bestStreak ?? 0, pN.bestStreak ?? 0)
  const currentStreak = Math.max(pG.streak ?? 0, pN.streak ?? 0)

  const today = todayKey()
  const didStudyToday = todayTotal > 0

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

      {/* ✅ 今日のメッセージ */}
      <div
        style={{
          margin: "10px 0 16px",
          padding: "10px 12px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          background: didStudyToday ? "#ecfdf5" : "#fff7ed",
          color: didStudyToday ? "#065f46" : "#9a3412",
          fontWeight: 800,
        }}
      >
        {didStudyToday
          ? `✅ 今日（${today}）も学習できています！この調子！`
          : `🟠 今日（${today}）はまだ学習がありません。1回だけでもやると streak が続きます！`}
      </div>

      {/* ✅ 学習進捗 */}
      <div
        style={{
          margin: "18px 0",
          padding: "14px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          textAlign: "left",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: "10px" }}>学習進捗（標準問題：完了回数）</h2>

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
            <div style={{ fontSize: 12, color: "#666" }}>今日の完了回数（合計）</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{todayTotal} 回</div>
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
            <div style={{ fontSize: 12, color: "#666" }}>累計の完了回数（合計）</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{allTotal} 回</div>
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
            <div style={{ fontSize: 12, color: "#666" }}>連続学習日数（最大/現在）</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>
              {bestStreak}日 / {currentStreak}日
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {QUIZ_TYPES.map((t) => {
            const badge = typeBadge(t)
            const p = progress[t] ?? {
              totalSessions: 0,
              todaySessions: 0,
              lastStudyDate: todayKey(),
              streak: 0,
              streakUpdatedDate: "",
              bestStreak: 0,
            }

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
                    今日：<b>{p.todaySessions}</b>回 / 累計：<b>{p.totalSessions}</b>回 / 連続：<b>{p.streak}</b>日（最高 {p.bestStreak}日）
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
                  学習する
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
          ※ 標準問題を「最後まで完了」した回数をカウントしています（中断はカウントされません）
        </p>
      </div>

      {/* ✅ 結果（模擬試験など） */}
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
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
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

          <h3 style={{ marginTop: 30 }}>正答率 推移（%）</h3>
          <svg width={320} height={160} style={{ marginTop: "8px" }}>
            {[0, 25, 50, 75, 100].map((p) => {
              const y = 160 - (p / 100) * 160
              return (
                <g key={p}>
                  <line x1={0} y1={y} x2={320} y2={y} stroke="#eee" />
                  <text x={0} y={y - 2} fontSize="10" fill="#999">
                    {p}%
                  </text>
                </g>
              )
            })}

            <polyline fill="none" stroke="#111" strokeWidth="3" points={points} />
            {accuracies.map((p, i) => {
              const x = accuracies.length === 1 ? 160 : (320 / (accuracies.length - 1)) * i
              const y = 160 - (p / 100) * 160
              return <circle key={i} cx={x} cy={y} r="4" fill="#111" />
            })}
          </svg>

          <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            ※ グラフは「正答率(%)」で表示しています
          </p>
        </>
      )}
    </div>
  )
}
