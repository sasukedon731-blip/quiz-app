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

const PASS_LINE = 0.8 // ✅ 模擬試験 合格ライン（80%）

type QuizResult = {
  score: number
  total: number
  createdAt: Timestamp | { seconds: number } | null
  quizType?: string
  mode?: string
  byTimeout?: boolean
  timeLeft?: number
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
  lastScoreText: string // "24/30"
  lastAccuracy: number // 0-100
}

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
  }
}

function badgeByType(quizType: string) {
  // 既存の雰囲気に合わせた簡易色（必要なら globals.css 側に寄せてもOK）
  if (quizType === "japanese-n4") return { text: "日本語検定N4", bg: "#ede9fe", fg: "#5b21b6" }
  if (quizType === "genba-listening") return { text: "現場用語リスニング", bg: "#fef3c7", fg: "#92400e" }
  return { text: "外国免許切替", bg: "#dbeafe", fg: "#1d4ed8" }
}

export default function MyPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Firestore から取る（正）
  const [progressByType, setProgressByType] = useState<Record<string, ProgressDoc>>({})
  const [results, setResults] = useState<QuizResult[]>([])

  // クイズ一覧（catalog を正として並べる）
  const quizTypes = useMemo(() => {
    return quizCatalog
      .filter(q => q.enabled)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map(q => q.id) as QuizType[]
  }, [])

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
        // ✅ progress 全件
        const pSnap = await getDocs(collection(db, "users", user.uid, "progress"))
        const p: Record<string, ProgressDoc> = {}
        pSnap.forEach(doc => {
          p[doc.id] = doc.data() as ProgressDoc
        })
        setProgressByType(p)

        // ✅ results 直近多め（exam合格率の集計に使う）
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

  // ✅ streak最高記録（全体）
  const overall = useMemo(() => {
    const list = Object.entries(progressByType)

    let best = 0
    let current = 0
    let totalAll = 0

    for (const [, v] of list) {
      best = Math.max(best, safeNum(v.bestStreak))
      current = Math.max(current, safeNum(v.streak))
      totalAll += safeNum(v.totalSessions)
    }

    return { bestStreak: best, currentStreak: current, totalAll }
  }, [progressByType])

  // ✅ Exam 合格率（クイズ別）
  const examStatsByType = useMemo(() => {
    const stats: Record<string, ExamStats> = {}

    // results は createdAt desc（最新→古い）
    for (const r of results) {
      const mode = r.mode ?? "exam"
      const quizType = r.quizType ?? "gaikoku-license"
      if (mode !== "exam") continue

      const total = safeNum(r.total, 0)
      const score = safeNum(r.score, 0)
      const acc = total > 0 ? score / total : 0
      const passed = acc >= PASS_LINE

      if (!stats[quizType]) {
        stats[quizType] = {
          attempts: 0,
          passes: 0,
          passRate: 0,
          lastScoreText: total > 0 ? `${score}/${total}` : "-",
          lastAccuracy: total > 0 ? Math.round(acc * 100) : 0,
        }
      }

      stats[quizType].attempts += 1
      if (passed) stats[quizType].passes += 1

      // last* は最初に当たった（最新）で固定
    }

    // passRate 計算
    Object.keys(stats).forEach(k => {
      const s = stats[k]
      s.passRate = s.attempts > 0 ? Math.round((s.passes / s.attempts) * 100) : 0
    })

    return stats
  }, [results])

  // ✅ クイズ別進捗（表示用）
  const quizCards = useMemo(() => {
    return quizTypes.map((qt) => {
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
  }, [quizTypes, progressByType])

  // ✅ 過去の結果（最新5件）表示（タブ簡略：全教材混在でOK）
  const latest5 = useMemo(() => {
    // results は最新→古いなので、そのまま先頭から5件
    return results.slice(0, 5).map(r => ({
      ...r,
      quizType: r.quizType ?? "gaikoku-license",
    }))
  }, [results])

  // ✅ グラフ用（最新5件の正答率）
  const accuracies = useMemo(() => {
    return latest5
      .slice()
      .reverse() // 左→右で古い→新しい
      .map((r) => (r.total ? Math.round((r.score / r.total) * 100) : 0))
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

  if (!user) return <p style={{ textAlign: "center" }}>確認中...</p>

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

      {/* ✅ ① streak最高記録 */}
      <div className="panelSoft" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>🔥 streak（連続学習日数）</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>最高記録</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{overall.bestStreak} 日</div>
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>現在</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{overall.currentStreak} 日</div>
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>累計学習完了回数（全教材）</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{overall.totalAll} 回</div>
          </div>
        </div>
      </div>

      {/* ✅ ② Exam 合格率（クイズ別） */}
      <div className="panelSoft" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>
          🧪 模擬試験 合格率（クイズ別）{" "}
          <span style={{ fontSize: 12, opacity: 0.7 }}>※ 合格ライン {Math.round(PASS_LINE * 100)}%</span>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {quizTypes.map((qt) => {
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

      {/* ✅ ③ クイズ別進捗 */}
      <div className="panelSoft" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>📚 クイズ別進捗（標準問題の完了回数）</div>

        {loading ? (
          <p>読み込み中…</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {quizCards.map((c) => (
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
          ※ ここは Firestore（users/{`{uid}`}/progress）を表示しています。端末が変わっても数字は安定します。
        </p>
      </div>

      {/* 参考：結果（最新5件）とグラフ（今の良い機能は残す） */}
      <div className="panelSoft" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>📈 過去の結果（最新5件）</div>

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
                  const acc = r.total ? Math.round((r.score / r.total) * 100) : 0
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
    </QuizLayout>
  )
}
