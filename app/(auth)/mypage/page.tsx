"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth, db } from "@/app/lib/firebase"
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"

import QuizLayout from "@/app/components/QuizLayout"
import Button from "@/app/components/Button"
import { quizCatalog } from "@/app/data/quizCatalog"
import type { QuizType } from "@/app/data/types"

// ✅ 模擬試験 合格ライン（科目別）
function getPassLine(quizType: string) {
  // 外国免許：50問中45問正解（=90%）で合格
  if (quizType === "gaikoku-license") return 0.9
  // それ以外：従来どおり80%
  return 0.8
}

type QuizResult = {
  score: number
  total: number
  createdAt: Timestamp | { seconds: number } | null
  quizType?: string
  mode?: string
  byTimeout?: boolean
}

type ProgressDoc = {
  totalSessions?: number
  todaySessions?: number
  streak?: number
  bestStreak?: number
  updatedAt?: Timestamp | { seconds: number } | null
}

type ExamStats = {
  attempts: number
  passes: number
  passRate: number // 0-100
  lastScoreText: string
  lastAccuracy: number // 0-100
}

type TabKey = "all" | QuizType

function toSeconds(ts: any): number | null {
  if (!ts) return null
  if (typeof ts?.seconds === "number") return ts.seconds
  if (typeof ts?.toDate === "function") return Math.floor(ts.toDate().getTime() / 1000)
  return null
}

function formatDateSeconds(seconds: number) {
  return new Date(seconds * 1000).toLocaleString()
}

function safeNum(v: any, fallback = 0) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback
}

function typeMeta(quizType: string) {
  const fromCatalog = quizCatalog.find(q => q.id === quizType)
  return {
    title: fromCatalog?.title ?? quizType,
    description: fromCatalog?.description ?? "",
    enabled: fromCatalog?.enabled ?? true,
    order: fromCatalog?.order ?? 999,
  }
}

function badgeByType(quizType: string) {
  if (quizType === "japanese-n4") return { text: "日本語検定N4", bg: "#ede9fe", fg: "#5b21b6" }
  if (quizType === "genba-listening") return { text: "現場用語リスニング", bg: "#fef3c7", fg: "#92400e" }
  return { text: "外国免許切替", bg: "#dbeafe", fg: "#1d4ed8" }
}

function pct(score: number, total: number) {
  if (!total) return 0
  return Math.round((score / total) * 100)
}

export default function MyPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [progressByType, setProgressByType] = useState<Record<string, ProgressDoc>>({})
  const [results, setResults] = useState<QuizResult[]>([])

  const quizTypes = useMemo(() => {
    return quizCatalog
      .filter(q => q.enabled)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map(q => q.id) as QuizType[]
  }, [])

  const [tab, setTab] = useState<TabKey>("all")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login")
      else setUser(u)
    })
    return () => unsub()
  }, [router])

  useEffect(() => {
    if (!user) return

    const run = async () => {
      setLoading(true)
      try {
        const pSnap = await getDocs(collection(db, "users", user.uid, "progress"))
        const p: Record<string, ProgressDoc> = {}
        pSnap.forEach(doc => {
          p[doc.id] = doc.data() as ProgressDoc
        })
        setProgressByType(p)

        const rQ = query(
          collection(db, "users", user.uid, "results"),
          orderBy("createdAt", "desc"),
          limit(200)
        )
        const rSnap = await getDocs(rQ)
        const r = rSnap.docs.map(d => d.data() as QuizResult)
        setResults(r)
      } catch (e) {
        console.error("mypage fetch error", e)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    router.replace("/login")
  }

  // ---- 全体サマリー ----
  const overall = useMemo(() => {
    const list = Object.entries(progressByType)
    let best = 0
    let current = 0
    let totalAll = 0
    let todayAll = 0

    for (const [, v] of list) {
      best = Math.max(best, safeNum(v.bestStreak))
      current = Math.max(current, safeNum(v.streak))
      totalAll += safeNum(v.totalSessions)
      todayAll += safeNum(v.todaySessions)
    }

    // 全体のexam合格率
    let attempts = 0
    let passes = 0
    for (const r of results) {
      if ((r.mode ?? "exam") !== "exam") continue
      const t = safeNum(r.total, 0)
      const s = safeNum(r.score, 0)
      if (t <= 0) continue
      attempts += 1
      const qt = r.quizType ?? "gaikoku-license"
      if (s / t >= getPassLine(qt)) passes += 1
    }
    const passRate = attempts ? Math.round((passes / attempts) * 100) : 0

    return { bestStreak: best, currentStreak: current, totalAll, todayAll, examAttempts: attempts, examPassRate: passRate }
  }, [progressByType, results])

  // ---- exam合格率（クイズ別） ----
  const examStatsByType = useMemo(() => {
    const stats: Record<string, ExamStats> = {}

    for (const r of results) {
      const mode = r.mode ?? "exam"
      const qt = r.quizType ?? "gaikoku-license"
      if (mode !== "exam") continue

      const total = safeNum(r.total, 0)
      const score = safeNum(r.score, 0)
      const acc = total > 0 ? score / total : 0
      const passed = acc >= getPassLine(qt)

      if (!stats[qt]) {
        stats[qt] = {
          attempts: 0,
          passes: 0,
          passRate: 0,
          lastScoreText: total > 0 ? `${score}/${total}` : "-",
          lastAccuracy: total > 0 ? Math.round(acc * 100) : 0,
        }
      }
      stats[qt].attempts += 1
      if (passed) stats[qt].passes += 1
    }

    Object.keys(stats).forEach(k => {
      const s = stats[k]
      s.passRate = s.attempts ? Math.round((s.passes / s.attempts) * 100) : 0
    })

    return stats
  }, [results])

  // ---- allタブ用：進捗ミニカード（全部表示するが軽量） ----
  const miniCardsAll = useMemo(() => {
    return quizTypes.map((qt) => {
      const meta = typeMeta(qt)
      const p = progressByType[qt] ?? {}
      const updatedSec = toSeconds(p.updatedAt)
      const badge = badgeByType(qt)
      return {
        quizType: qt,
        title: meta.title,
        badge,
        todaySessions: safeNum(p.todaySessions),
        totalSessions: safeNum(p.totalSessions),
        streak: safeNum(p.streak),
        bestStreak: safeNum(p.bestStreak),
        updatedText: updatedSec ? formatDateSeconds(updatedSec) : "-",
      }
    })
  }, [quizTypes, progressByType])

  // ---- 科目タブ用：対象教材だけ ----
  const activeQuizTypes = useMemo(() => {
    if (tab === "all") return quizTypes
    return [tab]
  }, [tab, quizTypes])

  const progressCards = useMemo(() => {
    return activeQuizTypes.map((qt) => {
      const meta = typeMeta(qt)
      const p = progressByType[qt] ?? {}
      const updatedSec = toSeconds(p.updatedAt)
      const badge = badgeByType(qt)
      return {
        quizType: qt,
        title: meta.title,
        description: meta.description,
        badge,
        totalSessions: safeNum(p.totalSessions),
        todaySessions: safeNum(p.todaySessions),
        streak: safeNum(p.streak),
        bestStreak: safeNum(p.bestStreak),
        updatedText: updatedSec ? formatDateSeconds(updatedSec) : "-",
      }
    })
  }, [activeQuizTypes, progressByType])

  // 科目タブだけ：最新5件＋グラフ
  const latest5 = useMemo(() => {
    if (tab === "all") return []
    const filtered = results.filter(r => (r.quizType ?? "gaikoku-license") === tab)
    return filtered.slice(0, 5).map(r => ({
      ...r,
      quizType: r.quizType ?? "gaikoku-license",
      mode: r.mode ?? "exam",
    }))
  }, [results, tab])

  const accuracies = useMemo(() => {
    if (tab === "all") return []
    return latest5
      .slice()
      .reverse()
      .map((r) => (r.total ? pct(r.score, r.total) : 0))
  }, [latest5, tab])

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

  if (!user) return <p style={{ textAlign: "center" }}>確認中...</p>

  const tabItems: { key: TabKey; label: string }[] = [
    { key: "all", label: "すべて" },
    ...quizTypes.map(qt => ({ key: qt, label: typeMeta(qt).title })),
  ]

  const isAll = tab === "all"

  return (
    <QuizLayout title="マイページ" subtitle={`ようこそ ${user.displayName ?? user.email} さん`}>
      <div className="actions">
        <Button variant="main" onClick={() => router.push("/")}>
          TOPに戻る
        </Button>
        <Button variant="accent" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>

      {/* ✅ 全体サマリー（常に表示） */}
      <div className="panelSoft" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>全体サマリー</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>streak（最高/現在）</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>
              {overall.bestStreak}日 / {overall.currentStreak}日
            </div>
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>学習完了（今日/累計）</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>
              {overall.todayAll}回 / {overall.totalAll}回
            </div>
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>模擬試験 合格率（全体）</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>
              {overall.examPassRate}%{" "}
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                （{overall.examAttempts}回）
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 科目タブ */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tabItems.map(t => {
          const active = tab === t.key
          return (
            <button
              key={String(t.key)}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: active ? "2px solid #111" : "1px solid var(--border)",
                background: active ? "#111" : "white",
                color: active ? "white" : "#111",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ✅ allタブ：軽量表示 */}
      {isAll ? (
        <>
          <div className="panelSoft" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>📚 進捗（教材別・軽量）</div>

            {loading ? (
              <p>読み込み中…</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {miniCardsAll.map((c) => (
                  <div
                    key={c.quizType}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 12,
                      background: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 260 }}>
                      <div style={{ marginBottom: 6 }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 999,
                            backgroundColor: c.badge.bg,
                            color: c.badge.fg,
                            fontWeight: 900,
                            fontSize: 12,
                            marginRight: 10,
                          }}
                        >
                          {c.badge.text}
                        </span>
                        <span style={{ fontWeight: 900 }}>{c.title}</span>
                      </div>

                      <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6 }}>
                        今日：<b>{c.todaySessions}</b>回 / 累計：<b>{c.totalSessions}</b>回 / 連続：<b>{c.streak}</b>日（最高 <b>{c.bestStreak}</b>日）
                        <br />
                        最終学習：<b>{c.updatedText}</b>
                      </div>
                    </div>

                    <div className="actions" style={{ marginTop: 0 }}>
                      <Button variant="main" onClick={() => router.push(`/select-mode?type=${encodeURIComponent(c.quizType)}`)}>
                        学習する
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              ※ 「すべて」タブは見やすさ重視で “軽量表示” です（結果一覧・グラフは科目タブで表示）。
            </p>
          </div>
        </>
      ) : (
        // ✅ 科目タブ：詳細表示
        <>
          {/* Exam 合格率（その科目のみ） */}
          <div className="panelSoft" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>
              🧪 模擬試験 合格率{" "}
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                ※ 合格ライン {activeQuizTypes.length === 1 ? `${Math.round(getPassLine(activeQuizTypes[0]) * 100)}%` : "科目別"}
              </span>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {activeQuizTypes.map((qt) => {
                const s = examStatsByType[qt]
                const badge = badgeByType(qt)
                const meta = typeMeta(qt)

                return (
                  <div
                    key={qt}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 12,
                      background: "white",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 999,
                            backgroundColor: badge.bg,
                            color: badge.fg,
                            fontWeight: 900,
                            fontSize: 12,
                            marginRight: 10,
                          }}
                        >
                          {badge.text}
                        </span>
                        <span style={{ fontWeight: 900 }}>{meta.title}</span>
                      </div>

                      {s ? (
                        <div style={{ fontWeight: 900 }}>
                          合格率 {s.passRate}%（{s.passes}/{s.attempts}） / 直近 {s.lastScoreText}（{s.lastAccuracy}%）
                        </div>
                      ) : (
                        <div style={{ opacity: 0.7, fontWeight: 700 }}>まだ模擬試験の記録がありません</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 進捗（その科目のみ） */}
          <div className="panelSoft" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>📚 進捗（標準問題）</div>

            {loading ? (
              <p>読み込み中…</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {progressCards.map((c) => (
                  <div
                    key={c.quizType}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 12,
                      background: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 260 }}>
                      <div style={{ marginBottom: 6 }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 999,
                            backgroundColor: c.badge.bg,
                            color: c.badge.fg,
                            fontWeight: 900,
                            fontSize: 12,
                            marginRight: 10,
                          }}
                        >
                          {c.badge.text}
                        </span>
                        <span style={{ fontWeight: 900 }}>{c.title}</span>
                      </div>

                      <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6 }}>
                        今日：<b>{c.todaySessions}</b>回 / 累計：<b>{c.totalSessions}</b>回 / 連続：<b>{c.streak}</b>日（最高 <b>{c.bestStreak}</b>日）
                        <br />
                        最終学習：<b>{c.updatedText}</b>
                      </div>
                    </div>

                    <div className="actions" style={{ marginTop: 0 }}>
                      <Button variant="main" onClick={() => router.push(`/select-mode?type=${encodeURIComponent(c.quizType)}`)}>
                        学習する
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              ※ ここは Firestore（users/{`{uid}`}/progress）を表示しています。
            </p>
          </div>

          {/* 結果（最新5件）＋グラフ（その科目のみ） */}
          <div className="panelSoft" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>📈 結果（最新5件）</div>

            {loading ? (
              <p>読み込み中…</p>
            ) : latest5.length === 0 ? (
              <p>まだ結果がありません</p>
            ) : (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid var(--border)", padding: 8 }}>教材</th>
                      <th style={{ border: "1px solid var(--border)", padding: 8 }}>モード</th>
                      <th style={{ border: "1px solid var(--border)", padding: 8 }}>日付</th>
                      <th style={{ border: "1px solid var(--border)", padding: 8 }}>スコア</th>
                      <th style={{ border: "1px solid var(--border)", padding: 8 }}>正答率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest5.map((r, i) => {
                      const qt = r.quizType ?? "gaikoku-license"
                      const badge = badgeByType(qt)
                      const acc = r.total ? pct(r.score, r.total) : 0
                      const sec = toSeconds(r.createdAt)
                      return (
                        <tr key={i}>
                          <td style={{ border: "1px solid var(--border)", padding: 8 }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: 999,
                                backgroundColor: badge.bg,
                                color: badge.fg,
                                fontWeight: 900,
                                fontSize: 12,
                              }}
                            >
                              {badge.text}
                            </span>
                          </td>
                          <td style={{ border: "1px solid var(--border)", padding: 8, fontWeight: 800 }}>
                            {r.mode ?? "exam"}
                          </td>
                          <td style={{ border: "1px solid var(--border)", padding: 8 }}>
                            {sec ? formatDateSeconds(sec) : "-"}
                          </td>
                          <td style={{ border: "1px solid var(--border)", padding: 8 }}>
                            {r.score} / {r.total}
                          </td>
                          <td style={{ border: "1px solid var(--border)", padding: 8, fontWeight: 900 }}>
                            {acc}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>正答率 推移（最新5件 / %）</div>
                  <svg width={graphWidth} height={graphHeight} style={{ marginTop: 8 }}>
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
                      const x = accuracies.length === 1 ? graphWidth / 2 : (graphWidth / (accuracies.length - 1)) * i
                      const y = graphHeight - (p / 100) * graphHeight
                      return <circle key={i} cx={x} cy={y} r="4" fill="#111" />
                    })}
                  </svg>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </QuizLayout>
  )
}
