"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore"

import { auth, db } from "@/app/lib/firebase"
import type { QuizType } from "@/app/data/types"
import { quizCatalog } from "@/app/data/quizCatalog"

type QuizResult = {
  score: number
  total: number
  accuracy?: number
  quizType?: QuizType | string
  mode?: string
  createdAt?: { seconds: number } | Date | null
}

type Progress = {
  totalSessions?: number
  todaySessions?: number
  streak?: number
  bestStreak?: number
  updatedAt?: any
}

function toDate(v: any): Date | null {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v?.toDate === "function") return v.toDate()
  if (typeof v?.seconds === "number") return new Date(v.seconds * 1000)
  try {
    return new Date(v)
  } catch {
    return null
  }
}

function fmtDate(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`
}

function titleByQuizType(qt?: string) {
  const hit = quizCatalog.find((q) => q.id === qt)
  return hit?.title ?? qt ?? "不明"
}

export default function MyPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [results, setResults] = useState<QuizResult[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({})

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login")
        return
      }
      setUser(u)
    })
    return () => unsub()
  }, [router])

  // Load mypage data
  useEffect(() => {
    ;(async () => {
      if (!user?.uid) return
      setLoading(true)
      setError("")
      try {
        // 1) latest results (global latest 5)
        // users/{uid}/results
        const resultsRef = collection(db, "users", user.uid, "results")
        const q1 = query(resultsRef, orderBy("createdAt", "desc"), limit(5))
        const snap = await getDocs(q1)
        const list: QuizResult[] = snap.docs.map((d) => {
          const data = d.data() as any
          return {
            score: Number(data.score ?? 0),
            total: Number(data.total ?? 0),
            accuracy: typeof data.accuracy === "number" ? data.accuracy : undefined,
            quizType: data.quizType,
            mode: data.mode,
            createdAt: data.createdAt ?? null,
          }
        })
        setResults(list)

        // 2) progress (optional)
        // users/{uid}/progress/{quizType}
        // quizCatalogのid一覧で取りに行く（存在しない場合は無視）
        const pMap: Record<string, Progress> = {}
        await Promise.all(
          quizCatalog.map(async (q) => {
            try {
              const pRef = doc(db, "users", user.uid, "progress", q.id)
              const pSnap = await getDoc(pRef)
              if (pSnap.exists()) {
                pMap[q.id] = pSnap.data() as any
              }
            } catch {
              // ignore
            }
          })
        )
        setProgressMap(pMap)
      } catch (e) {
        console.error(e)
        setError("読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.uid])

  const displayName = useMemo(() => {
    return (
      user?.displayName ||
      user?.email?.split("@")[0] ||
      "ユーザー"
    )
  }, [user])

  const latestAccList = useMemo(() => {
    // accuracy がない場合 score/total から計算
    return results
      .map((r) => {
        const acc =
          typeof r.accuracy === "number"
            ? r.accuracy
            : r.total > 0
            ? Math.round((r.score / r.total) * 100)
            : 0
        return { ...r, acc }
      })
      .slice()
      .reverse() // 古い→新しいの順（グラフ向き）
  }, [results])

  const avgAcc = useMemo(() => {
    if (!latestAccList.length) return null
    const sum = latestAccList.reduce((a, b) => a + (b as any).acc, 0)
    return Math.round(sum / latestAccList.length)
  }, [latestAccList])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (e) {
      console.error(e)
      setError("ログアウトに失敗しました")
    }
  }

  return (
    <main style={S.main}>
      {/* Topbar (52px) */}
      <header style={S.topbar}>
        <button
          aria-label="menu"
          onClick={() => setDrawerOpen(true)}
          style={S.iconBtn}
        >
          ☰
        </button>
        <div style={S.topbarTitle}>マイページ</div>
        <div style={{ width: 40 }} />
      </header>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div
            style={S.drawerOverlay}
            onClick={() => setDrawerOpen(false)}
          />
          <aside style={S.drawer}>
            <div style={S.drawerHead}>
              <div style={{ fontWeight: 900 }}>MENU</div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={S.drawerClose}
                aria-label="close"
              >
                ✕
              </button>
            </div>

            <nav style={S.nav}>
              <Link style={S.navItem} href="/" onClick={() => setDrawerOpen(false)}>
                🏠 TOP（LP）
              </Link>
              <Link style={S.navItem} href="/select-mode" onClick={() => setDrawerOpen(false)}>
                🎮 学習を始める
              </Link>
              <Link style={S.navItem} href="/plans" onClick={() => setDrawerOpen(false)}>
                💳 プラン
              </Link>
              <Link style={S.navItem} href="/contents" onClick={() => setDrawerOpen(false)}>
                📚 教材一覧
              </Link>

              <div style={S.navSep} />

              <button style={S.navDanger} onClick={handleLogout}>
                🚪 ログアウト
              </button>
            </nav>
          </aside>
        </>
      )}

      {/* Content */}
      <section style={{ marginTop: 14 }}>
        <div style={S.hero}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>こんにちは</div>
          <div style={{ fontSize: 20, fontWeight: 900, marginTop: 2 }}>
            {displayName} さん
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={S.primaryBtn} onClick={() => router.push("/select-mode")}>
              学習を始める
            </button>
            <button style={S.ghostBtn} onClick={() => router.push("/plans")}>
              プランを見る
            </button>
          </div>
        </div>

        {error && <p style={S.error}>{error}</p>}

        {/* Quick stats */}
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={S.cardTitle}>直近5回の平均正答率</div>
            <div style={S.bigNumber}>
              {avgAcc === null ? "—" : `${avgAcc}%`}
            </div>
            <div style={S.miniNote}>模擬/通常が混在してもOK</div>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>連続学習（streak）</div>
            <div style={S.bigNumber}>
              {(() => {
                // progressMap から最大値だけ拾う（教材別があるため）
                const vals = Object.values(progressMap)
                const best = vals.reduce((m, p) => Math.max(m, Number(p.streak ?? 0)), 0)
                return best ? `${best}日` : "—"
              })()}
            </div>
            <div style={S.miniNote}>教材別の最大streakを表示</div>
          </div>
        </div>

        {/* Mini chart */}
        <section style={S.card}>
          <div style={S.cardHeadRow}>
            <div>
              <div style={S.cardTitle}>直近の成績</div>
              <div style={S.subtle}>（古い→新しい）</div>
            </div>
          </div>

          {latestAccList.length === 0 ? (
            <div style={{ opacity: 0.7, fontSize: 13, paddingTop: 6 }}>
              まだ記録がありません。まずは1回プレイしてみよう！
            </div>
          ) : (
            <div style={S.barWrap}>
              {latestAccList.map((r: any, i: number) => (
                <div key={i} style={S.barCol}>
                  <div
                    style={{
                      ...S.bar,
                      height: `${Math.max(8, Math.min(100, r.acc))}%`,
                    }}
                    title={`${r.acc}%`}
                  />
                  <div style={S.barLabel}>{r.acc}%</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Latest results list */}
        <section style={S.card}>
          <div style={S.cardHeadRow}>
            <div style={S.cardTitle}>最新5件</div>
            <button style={S.linkBtn} onClick={() => router.push("/select-mode")}>
              もう一回やる →
            </button>
          </div>

          {results.length === 0 ? (
            <div style={{ opacity: 0.7, fontSize: 13, paddingTop: 6 }}>
              まだ結果がありません。学習を開始してください。
            </div>
          ) : (
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {results.map((r, idx) => {
                const d = toDate(r.createdAt)
                const acc =
                  typeof r.accuracy === "number"
                    ? r.accuracy
                    : r.total > 0
                    ? Math.round((r.score / r.total) * 100)
                    : 0

                return (
                  <div key={idx} style={S.rowCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={S.rowTitle}>
                          {titleByQuizType(String(r.quizType))}
                        </div>
                        <div style={S.rowSub}>
                          {r.mode ? `mode: ${r.mode}` : "mode: —"}{" "}
                          {d ? `・${fmtDate(d)}` : ""}
                        </div>
                      </div>

                      <div style={S.rowScoreBox}>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>{acc}%</div>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>
                          {r.score}/{r.total}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Per quiz progress (optional) */}
        <section style={S.card}>
          <div style={S.cardHeadRow}>
            <div style={S.cardTitle}>教材ごとの進捗</div>
            <button style={S.linkBtn} onClick={() => router.push("/contents")}>
              教材を見る →
            </button>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {quizCatalog.map((q) => {
              const p = progressMap[q.id] ?? {}
              const totalSessions = Number(p.totalSessions ?? 0)
              const today = Number(p.todaySessions ?? 0)
              const streak = Number(p.streak ?? 0)
              const best = Number(p.bestStreak ?? 0)

              return (
                <div key={q.id} style={S.rowCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={S.rowTitle}>{q.title}</div>
                      <div style={S.rowSub}>
                        総回数: {totalSessions} ・ 今日: {today}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900 }}>{streak ? `${streak}日` : "—"}</div>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>
                        best: {best || "—"}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      style={S.smallBtn}
                      onClick={() => router.push(`/select-mode?type=${q.id}`)}
                      title="この教材で始める（select-modeがtype対応している場合に有効）"
                    >
                      この教材で始める
                    </button>
                    <button
                      style={S.smallGhostBtn}
                      onClick={() => router.push(`/contents/${q.id}`)}
                    >
                      内容を見る
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div style={{ height: 32 }} />
      </section>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "0 14px 18px",
  },

  // 52px top bar
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px",
    background: "rgba(255,255,255,.92)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(17,24,39,.08)",
  },
  topbarTitle: { fontWeight: 900, fontSize: 14 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,.12)",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  drawerOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    zIndex: 50,
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100%",
    width: "min(340px, 92vw)",
    background: "#fff",
    zIndex: 60,
    borderLeft: "1px solid rgba(17,24,39,.10)",
    boxShadow: "-12px 0 30px rgba(0,0,0,.12)",
    display: "flex",
    flexDirection: "column",
  },
  drawerHead: {
    height: 56,
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(17,24,39,.08)",
  },
  drawerClose: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,.12)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  nav: { padding: 14, display: "grid", gap: 10 },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(17,24,39,.10)",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 900,
  },
  navSep: { height: 1, background: "rgba(17,24,39,.08)", margin: "4px 0" },
  navDanger: {
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(220,38,38,.25)",
    background: "rgba(220,38,38,.08)",
    color: "#b91c1c",
    fontWeight: 900,
    cursor: "pointer",
    textAlign: "left",
  },

  hero: {
    padding: 14,
    borderRadius: 18,
    background: "#fff",
    border: "1px solid rgba(17,24,39,.10)",
  },

  grid2: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
  },

  card: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    background: "#fff",
    border: "1px solid rgba(17,24,39,.10)",
  },

  cardTitle: { fontWeight: 900, fontSize: 14 },
  subtle: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  cardHeadRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  bigNumber: { fontSize: 28, fontWeight: 900, marginTop: 8 },
  miniNote: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  barWrap: {
    marginTop: 12,
    height: 120,
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
  },
  barCol: { width: "100%", display: "grid", gap: 6, alignItems: "end" },
  bar: {
    width: "100%",
    borderRadius: 12,
    background: "rgba(37,99,235,.18)",
    border: "1px solid rgba(37,99,235,.25)",
  },
  barLabel: { fontSize: 12, opacity: 0.75, textAlign: "center" },

  rowCard: {
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(17,24,39,.10)",
    background: "rgba(249,250,251,1)",
  },
  rowTitle: {
    fontWeight: 900,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rowSub: { fontSize: 12, opacity: 0.75, marginTop: 2 },

  rowScoreBox: {
    flex: "0 0 auto",
    textAlign: "right",
    padding: "8px 10px",
    borderRadius: 14,
    border: "1px solid rgba(17,24,39,.10)",
    background: "#fff",
  },

  linkBtn: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: 900,
    cursor: "pointer",
    padding: 0,
  },

  primaryBtn: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  ghostBtn: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(17,24,39,.12)",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
  },

  smallBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  smallGhostBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,.12)",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
  },

  error: { color: "#dc2626", fontWeight: 900, marginTop: 10 },
}