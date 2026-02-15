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
import { loadAndRepairUserPlanState } from "@/app/lib/userPlanState"

// ✅ 模擬試験 合格ライン（科目別）
function getPassLine(quizType: string) {
  if (quizType === "gaikoku-license") return 0.9
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

type ViewKey = "current" | "history"

function toSeconds(ts: any): number | null {
  if (!ts) return null
  if (typeof ts?.seconds === "number") return ts.seconds
  if (typeof ts?.toDate === "function")
    return Math.floor(ts.toDate().getTime() / 1000)
  return null
}

function formatDateSeconds(seconds: number) {
  return new Date(seconds * 1000).toLocaleString()
}

function safeNum(v: any, fallback = 0) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback
}

function typeMeta(quizType: string) {
  const fromCatalog = quizCatalog.find((q) => q.id === quizType)
  return {
    title: fromCatalog?.title ?? quizType,
    description: fromCatalog?.description ?? "",
    enabled: fromCatalog?.enabled ?? true,
    order: fromCatalog?.order ?? 999,
  }
}

function badgeByType(quizType: string) {
  if (quizType === "japanese-n4")
    return { text: "日本語検定N4", bg: "#ede9fe", fg: "#5b21b6" }
  if (quizType === "genba-listening")
    return { text: "現場用語リスニング", bg: "#fef3c7", fg: "#92400e" }
  return { text: "外国免許切替", bg: "#dbeafe", fg: "#1d4ed8" }
}

function pct(score: number, total: number) {
  if (!total) return 0
  return Math.round((score / total) * 100)
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr))
}

export default function MyPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [progressByType, setProgressByType] = useState<
    Record<string, ProgressDoc>
  >({})
  const [results, setResults] = useState<QuizResult[]>([])

  // ✅ 今月の受講教材（selectedQuizTypes）をここで取得する
  const [selectedTypes, setSelectedTypes] = useState<QuizType[]>([])
  const [selectedLoaded, setSelectedLoaded] = useState(false)

  // 表示モード：進行中 / 履歴あり
  const [view, setView] = useState<ViewKey>("current")

  // 詳細表示する教材（nullなら詳細非表示）
  const [focusType, setFocusType] = useState<QuizType | null>(null)

  // ✅ 依存配列を空にしない（hydration対策）
  const quizTypesAll = useMemo(() => {
    return quizCatalog
      .filter((q) => q.enabled)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map((q) => q.id) as QuizType[]
  }, [quizCatalog])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login")
        return
      }
      setUser(u)
    })
    return () => unsub()
  }, [router])

  // ✅ progress/results を取得
  useEffect(() => {
    if (!user) return

    const run = async () => {
      setLoading(true)
      try {
        const pSnap = await getDocs(
          collection(db, "users", user.uid, "progress")
        )
        const p: Record<string, ProgressDoc> = {}
        pSnap.forEach((doc) => {
          p[doc.id] = doc.data() as ProgressDoc
        })
        setProgressByType(p)

        const rQ = query(
          collection(db, "users", user.uid, "results"),
          orderBy("createdAt", "desc"),
          limit(200)
        )
        const rSnap = await getDocs(rQ)
        const r = rSnap.docs.map((d) => d.data() as QuizResult)
        setResults(r)
      } catch (e) {
        console.error("mypage fetch error", e)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [user])

  // ✅ selectedQuizTypes を取得（今月の受講教材）
  useEffect(() => {
    if (!user) return

    let alive = true
    setSelectedLoaded(false)

    ;(async () => {
      try {
        const st = await loadAndRepairUserPlanState(user.uid)
        if (!alive) return

        // ✅ stがundefinedでも落ちない
        const arr =
          st && Array.isArray((st as any).selectedQuizTypes)
            ? ((st as any).selectedQuizTypes as QuizType[])
            : []
        setSelectedTypes(arr)
      } catch (e) {
        console.error("loadAndRepairUserPlanState failed:", e)
        if (!alive) return
        setSelectedTypes([])
      } finally {
        if (!alive) return
        setSelectedLoaded(true)
      }
    })()

    return () => {
      alive = false
    }
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

    return {
      bestStreak: best,
      currentStreak: current,
      totalAll,
      todayAll,
      examAttempts: attempts,
      examPassRate: passRate,
    }
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

    Object.keys(stats).forEach((k) => {
      const s = stats[k]
      s.passRate = s.attempts ? Math.round((s.passes / s.attempts) * 100) : 0
    })

    return stats
  }, [results])

  // ✅ 履歴あり（progress or results に存在）
  const historyTypes = useMemo(() => {
    const fromProgress = Object.keys(progressByType) as QuizType[]
    const fromResults = results.map(
      (r) => (r.quizType ?? "gaikoku-license") as QuizType
    )
    return uniq([...fromProgress, ...fromResults])
  }, [progressByType, results])

  // ✅ “進行中” と “履歴あり” を、カタログ順に整列
  const sortedByCatalogOrder = useMemo(() => {
    const orderMap = new Map<string, number>()
    quizCatalog.forEach((q, i) => orderMap.set(q.id, q.order ?? i ?? 999))
    return (types: QuizType[]) => {
      return types
        .filter((t) => typeMeta(t).enabled)
        .sort((a, b) => (orderMap.get(a) ?? 999) - (orderMap.get(b) ?? 999))
    }
  }, [])

  const currentList = useMemo(() => {
    return sortedByCatalogOrder(selectedTypes)
  }, [selectedTypes, sortedByCatalogOrder])

  const historyList = useMemo(() => {
    const setSelected = new Set(selectedTypes)
    const list = historyTypes.filter((t) => !setSelected.has(t))
    return sortedByCatalogOrder(list)
  }, [historyTypes, selectedTypes, sortedByCatalogOrder])

  const visibleList = useMemo(() => {
    return view === "current" ? currentList : historyList
  }, [view, currentList, historyList])

  // ---- 詳細表示用：対象教材 ----
  const focusMeta = useMemo(() => {
    if (!focusType) return null
    return typeMeta(focusType)
  }, [focusType])

  const focusProgress = useMemo(() => {
    if (!focusType) return null
    const p = progressByType[focusType] ?? {}
    const updatedSec = toSeconds(p.updatedAt)
    return {
      totalSessions: safeNum(p.totalSessions),
      todaySessions: safeNum(p.todaySessions),
      streak: safeNum(p.streak),
      bestStreak: safeNum(p.bestStreak),
      updatedText: updatedSec ? formatDateSeconds(updatedSec) : "-",
    }
  }, [focusType, progressByType])

  const latest5 = useMemo(() => {
    if (!focusType) return []
    const filtered = results.filter(
      (r) => (r.quizType ?? "gaikoku-license") === focusType
    )
    return filtered.slice(0, 5).map((r) => ({
      ...r,
      quizType: r.quizType ?? "gaikoku-license",
      mode: r.mode ?? "exam",
    }))
  }, [results, focusType])

  const accuracies = useMemo(() => {
    return latest5
      .slice()
      .reverse()
      .map((r) => (r.total ? pct(r.score, r.total) : 0))
  }, [latest5])

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

  // ✅ “Hooksの前にreturnしない” ため QuizLayout を返す
  if (!user) {
    return (
      <QuizLayout title="マイページ">
        <p style={{ textAlign: "center" }}>確認中...</p>
      </QuizLayout>
    )
  }

  const cards = useMemo(() => {
    return visibleList.map((qt) => {
      const meta = typeMeta(qt)
      const badge = badgeByType(qt)
      const p = progressByType[qt] ?? {}
      const updatedSec = toSeconds(p.updatedAt)
      const exam = examStatsByType[qt]
      return {
        quizType: qt,
        title: meta.title,
        description: meta.description ?? "",
        badge,
        todaySessions: safeNum(p.todaySessions),
        totalSessions: safeNum(p.totalSessions),
        streak: safeNum(p.streak),
        bestStreak: safeNum(p.bestStreak),
        updatedText: updatedSec ? formatDateSeconds(updatedSec) : "-",
        exam,
      }
    })
  }, [visibleList, progressByType, examStatsByType])

  const showEmptyState =
    selectedLoaded &&
    ((view === "current" && currentList.length === 0) ||
      (view === "history" && historyList.length === 0))

  return (
    <QuizLayout title="マイページ" subtitle={`ようこそ ${user.displayName ?? user.email} さん`}>
      {/* Header actions */}
      <div className="actions">
        <Button variant="main" onClick={() => router.push("/select-mode")}>
          学習を始める
        </Button>
        <Button variant="accent" onClick={() => router.push("/select-quizzes")}>
          教材選択
        </Button>
        <Button variant="sub" onClick={() => router.push("/plans")}>
          プラン
        </Button>
        <Button variant="danger" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>

      {/* Overall summary */}
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

      {/* View switch */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => {
            setView("current")
            setFocusType(null)
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: view === "current" ? "2px solid #111" : "1px solid var(--border)",
            background: view === "current" ? "#111" : "white",
            color: view === "current" ? "white" : "#111",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          進行中（今月）{selectedLoaded ? ` ${currentList.length}` : ""}
        </button>

        <button
          onClick={() => {
            setView("history")
            setFocusType(null)
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: view === "history" ? "2px solid #111" : "1px solid var(--border)",
            background: view === "history" ? "#111" : "white",
            color: view === "history" ? "white" : "#111",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          履歴あり（過去）{selectedLoaded ? ` ${historyList.length}` : ""}
        </button>
      </div>

      {/* List */}
      <div className="panelSoft" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>
          {view === "current" ? "🔥 進行中の教材" : "📚 履歴のある教材"}
        </div>

        {loading ? (
          <p>読み込み中…</p>
        ) : showEmptyState ? (
          <div style={{ padding: 12, borderRadius: 12, background: "white", border: "1px solid var(--border)" }}>
            {view === "current" ? (
              <>
                <div style={{ fontWeight: 900 }}>今月の教材が未選択です</div>
                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  「教材選択」から今月受講する教材を選ぶと、ここに表示されます。
                </div>
                <div style={{ marginTop: 10 }}>
                  <Button variant="main" onClick={() => router.push("/select-quizzes")}>
                    教材を選ぶ
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 900 }}>履歴がまだありません</div>
                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  学習や模擬試験をすると、履歴がここに溜まっていきます。
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {cards.map((c) => (
              <div
                key={c.quizType}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 14,
                  background: "white",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 200,
                }}
              >
                <div style={{ marginBottom: 8 }}>
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

                {/* 説明文の有無に関係なく高さ確保 */}
                {c.description ? (
                  <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6, minHeight: 44 }}>
                    {c.description}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, opacity: 0.55, minHeight: 44 }}>（説明なし）</div>
                )}

                <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6, marginTop: 6 }}>
                  今日：<b>{c.todaySessions}</b>回 / 累計：<b>{c.totalSessions}</b>回 / 連続：
                  <b>{c.streak}</b>日（最高 <b>{c.bestStreak}</b>日）
                  <br />
                  最終学習：<b>{c.updatedText}</b>
                  {c.exam ? (
                    <>
                      <br />
                      模擬：合格率 <b>{c.exam.passRate}%</b>（{c.exam.passes}/{c.exam.attempts}） / 直近{" "}
                      <b>{c.exam.lastScoreText}</b>（{c.exam.lastAccuracy}%）
                    </>
                  ) : null}
                </div>

                {/* ✅ ボタンは常に下 */}
                <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button variant="main" onClick={() => router.push(`/normal?type=${encodeURIComponent(c.quizType)}`)}>
                    通常
                  </Button>
                  <Button variant="sub" onClick={() => router.push(`/exam?type=${encodeURIComponent(c.quizType)}`)}>
                    模擬
                  </Button>
                  <Button variant="accent" onClick={() => router.push(`/review?type=${encodeURIComponent(c.quizType)}`)}>
                    復習
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFocusType(c.quizType)
                      // ✅ windowガード（本番対策）
                      setTimeout(() => {
                        if (typeof window !== "undefined") {
                          document.getElementById("detail")?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                        }
                      }, 50)
                    }}
                  >
                    詳細
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          ※ 「進行中」は今月の受講教材のみ、「履歴あり」は過去に学習/模擬した教材のみ表示します。
        </p>
      </div>

      {/* Detail */}
      {focusType ? (
        <div id="detail" className="panelSoft" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            🔎 詳細：{badgeByType(focusType).text} / {focusMeta?.title ?? focusType}
          </div>

          {/* Exam stats */}
          <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "white", border: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>
              🧪 模擬試験 合格率（合格ライン {Math.round(getPassLine(focusType) * 100)}%）
            </div>

            {examStatsByType[focusType] ? (
              <div style={{ fontWeight: 900 }}>
                合格率 {examStatsByType[focusType].passRate}%（{examStatsByType[focusType].passes}/
                {examStatsByType[focusType].attempts}） / 直近 {examStatsByType[focusType].lastScoreText}（
                {examStatsByType[focusType].lastAccuracy}%）
              </div>
            ) : (
              <div style={{ opacity: 0.7, fontWeight: 700 }}>まだ模擬試験の記録がありません</div>
            )}
          </div>

          {/* Progress */}
          <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "white", border: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>📚 進捗（標準問題）</div>
            {focusProgress ? (
              <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.7 }}>
                今日：<b>{focusProgress.todaySessions}</b>回 / 累計：<b>{focusProgress.totalSessions}</b>回
                <br />
                連続：<b>{focusProgress.streak}</b>日（最高 <b>{focusProgress.bestStreak}</b>日）
                <br />
                最終学習：<b>{focusProgress.updatedText}</b>
              </div>
            ) : (
              <div style={{ opacity: 0.7 }}>進捗がありません</div>
            )}
          </div>

          {/* Latest 5 + graph */}
          <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "white", border: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>📈 結果（最新5件）</div>

            {latest5.length === 0 ? (
              <p>まだ結果がありません</p>
            ) : (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid var(--border)", padding: 8 }}>モード</th>
                      <th style={{ border: "1px solid var(--border)", padding: 8 }}>日付</th>
                      <th style={{ border: "1px solid var(--border)", padding: 8 }}>スコア</th>
                      <th style={{ border: "1px solid var(--border)", padding: 8 }}>正答率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest5.map((r, i) => {
                      const acc = r.total ? pct(r.score, r.total) : 0
                      const sec = toSeconds(r.createdAt)
                      return (
                        <tr key={i}>
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

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="sub" onClick={() => setFocusType(null)}>
              詳細を閉じる
            </Button>
            <Button variant="main" onClick={() => router.push(`/normal?type=${encodeURIComponent(focusType)}`)}>
              この教材で学習する
            </Button>
          </div>
        </div>
      ) : null}
    </QuizLayout>
  )
}
