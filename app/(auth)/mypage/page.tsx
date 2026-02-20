"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where, // ✅ 必須
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
  createdAt?: any
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

function calcAcc(r: QuizResult) {
  if (typeof r.accuracy === "number") return Math.round(r.accuracy)
  if (r.total > 0) return Math.round((r.score / r.total) * 100)
  return 0
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

type DetailState = {
  open: boolean
  quizType: string | null
  title: string
  results: QuizResult[]
  progress: Progress | null
}

export default function MyPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // summary data
  const [latestResults, setLatestResults] = useState<QuizResult[]>([]) // global latest 5
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({})
  const [latestByQuiz, setLatestByQuiz] = useState<Record<string, QuizResult | null>>({})

  // detail modal
  const [detail, setDetail] = useState<DetailState>({
    open: false,
    quizType: null,
    title: "",
    results: [],
    progress: null,
  })
  const [detailLoading, setDetailLoading] = useState(false)

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

  // Load summary
  useEffect(() => {
    ;(async () => {
      if (!user?.uid) return
      setLoading(true)
      setError("")
      try {
        // latest 5 overall
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
        setLatestResults(list)

        // progress per quiz (optional)
        const pMap: Record<string, Progress> = {}
        await Promise.all(
          quizCatalog.map(async (q) => {
            try {
              const pRef = doc(db, "users", user.uid, "progress", q.id)
              const pSnap = await getDoc(pRef)
              if (pSnap.exists()) pMap[q.id] = pSnap.data() as any
            } catch {
              // ignore
            }
          })
        )
        setProgressMap(pMap)

        // latest result per quizType (1件だけ)
        const lbq: Record<string, QuizResult | null> = {}
        await Promise.all(
          quizCatalog.map(async (q) => {
            try {
              const qx = query(
                resultsRef,
                where("quizType", "==", q.id),
                orderBy("createdAt", "desc"),
                limit(1)
              )
              const s = await getDocs(qx)
              lbq[q.id] = s.docs.length ? (s.docs[0].data() as any) : null
              if (lbq[q.id]) {
                const d = lbq[q.id] as any
                lbq[q.id] = {
                  score: Number(d.score ?? 0),
                  total: Number(d.total ?? 0),
                  accuracy: typeof d.accuracy === "number" ? d.accuracy : undefined,
                  quizType: d.quizType,
                  mode: d.mode,
                  createdAt: d.createdAt ?? null,
                }
              }
            } catch {
              lbq[q.id] = null
            }
          })
        )
        setLatestByQuiz(lbq)
      } catch (e) {
        console.error(e)
        setError("読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.uid])

  const displayName = useMemo(() => {
    return user?.displayName || user?.email?.split("@")[0] || "ユーザー"
  }, [user])

  const avgAcc = useMemo(() => {
    if (!latestResults.length) return null
    const accs = latestResults.map(calcAcc)
    const sum = accs.reduce((a, b) => a + b, 0)
    return Math.round(sum / accs.length)
  }, [latestResults])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (e) {
      console.error(e)
      setError("ログアウトに失敗しました")
    }
  }

  const openDetail = async (quizId: string, title: string) => {
    if (!user?.uid) return
    setDetailLoading(true)
    setError("")
    try {
      const resultsRef = collection(db, "users", user.uid, "results")

      // latest 5 for this quizType
      const qx = query(
        resultsRef,
        where("quizType", "==", quizId),
        orderBy("createdAt", "desc"),
        limit(5)
      )
      const s = await getDocs(qx)
      const list: QuizResult[] = s.docs.map((d) => {
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

      // progress
      let prog: Progress | null = null
      try {
        const pRef = doc(db, "users", user.uid, "progress", quizId)
        const pSnap = await getDoc(pRef)
        prog = pSnap.exists() ? (pSnap.data() as any) : null
      } catch {
        prog = null
      }

      setDetail({
        open: true,
        quizType: quizId,
        title,
        results: list,
        progress: prog,
      })
    } catch (e) {
      console.error(e)
      setError("詳細の読み込みに失敗しました")
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setDetail((d) => ({ ...d, open: false }))
  }

  if (loading) return <div style={{ padding: 24 }}>読み込み中...</div>

  return (
    <main style={S.main}>
      {/* Topbar (52px) - ☰を右上に */}
      <header style={S.topbar}>
        <div style={S.leftSlot}>
          {/* 左は空（TOPと同じで右に寄せたい） */}
        </div>

        <div style={S.topbarTitle}>マイページ</div>

        <button
          aria-label="menu"
          onClick={() => setDrawerOpen(true)}
          style={S.iconBtn}
        >
          ☰
        </button>
      </header>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div style={S.drawerOverlay} onClick={() => setDrawerOpen(false)} />
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
              <Link
                style={S.navItem}
                href="/select-mode"
                onClick={() => setDrawerOpen(false)}
              >
                🎮 学習を始める
              </Link>
              <Link
                style={S.navItem}
                href="/plans"
                onClick={() => setDrawerOpen(false)}
              >
                💳 プラン
              </Link>
              <Link
                style={S.navItem}
                href="/contents"
                onClick={() => setDrawerOpen(false)}
              >
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

      <section style={{ marginTop: 14 }}>
        {/* hero */}
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

        {/* quick stats */}
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={S.cardTitle}>直近5回の平均正答率</div>
            <div style={S.bigNumber}>{avgAcc === null ? "—" : `${avgAcc}%`}</div>
            <div style={S.miniNote}>直近の全教材まとめ</div>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>連続学習（streak）</div>
            <div style={S.bigNumber}>
              {(() => {
                const vals = Object.values(progressMap)
                const best = vals.reduce(
                  (m, p) => Math.max(m, Number(p.streak ?? 0)),
                  0
                )
                return best ? `${best}日` : "—"
              })()}
            </div>
            <div style={S.miniNote}>教材別の最大streak</div>
          </div>
        </div>

        {/* ✅ 教材カード（コンパクト：記録だけ + 詳細ボタン） */}
        <section style={S.card}>
          <div style={S.cardHeadRow}>
            <div style={S.cardTitle}>教材</div>
            <button style={S.linkBtn} onClick={() => router.push("/contents")}>
              教材一覧 →
            </button>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {quizCatalog.map((q) => {
              const p = progressMap[q.id] ?? {}
              const last = latestByQuiz[q.id] ?? null

              const totalSessions = Number(p.totalSessions ?? 0)
              const streak = Number(p.streak ?? 0)
              const lastAcc = last ? calcAcc(last as any) : null

              return (
                <div key={q.id} style={S.compactRow}>
                  <div style={{ minWidth: 0 }}>
                    <div style={S.rowTitle}>{q.title}</div>
                    <div style={S.rowSub}>
                      {lastAcc === null ? "最新：—" : `最新：${lastAcc}%`} ・ 総回数：{totalSessions} ・ streak：
                      {streak || "—"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      style={S.smallGhostBtn}
                      onClick={() => openDetail(q.id, q.title)}
                      disabled={detailLoading}
                    >
                      {detailLoading && detail.quizType === q.id ? "読込中..." : "詳細"}
                    </button>
                    <button
                      style={S.smallBtn}
                      onClick={() => router.push(`/select-mode?type=${q.id}`)}
                      title="select-modeがtype対応している場合に有効"
                    >
                      開始
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 最新5件（全体） */}
        <section style={S.card}>
          <div style={S.cardHeadRow}>
            <div style={S.cardTitle}>最新5件（全体）</div>
            <button style={S.linkBtn} onClick={() => router.push("/select-mode")}>
              もう一回やる →
            </button>
          </div>

          {latestResults.length === 0 ? (
            <div style={{ opacity: 0.7, fontSize: 13, paddingTop: 6 }}>
              まだ結果がありません。まずは1回プレイしてみよう！
            </div>
          ) : (
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {latestResults.map((r, idx) => {
                const d = toDate(r.createdAt)
                const acc = calcAcc(r)

                return (
                  <div key={idx} style={S.rowCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={S.rowTitle}>{titleByQuizType(String(r.quizType))}</div>
                        <div style={S.rowSub}>
                          {r.mode ? `mode: ${r.mode}` : "mode: —"} {d ? `・${fmtDate(d)}` : ""}
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

        <div style={{ height: 32 }} />
      </section>

      {/* ✅ 詳細モーダル（グラフ + 詳細記録） */}
      {detail.open && (
        <>
          <div style={S.modalOverlay} onClick={closeDetail} />
          <div style={S.modal}>
            <div style={S.modalHead}>
              <div style={{ minWidth: 0 }}>
                <div style={S.modalTitle}>{detail.title}</div>
                <div style={S.modalSub}>直近の記録（最新→過去）</div>
              </div>
              <button style={S.drawerClose} onClick={closeDetail} aria-label="close">
                ✕
              </button>
            </div>

            {/* progress */}
            <div style={S.modalCard}>
              <div style={S.cardTitle}>進捗</div>
              <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
                <div style={S.kpiBox}>
                  <div style={S.kpiLabel}>総回数</div>
                  <div style={S.kpiValue}>{Number(detail.progress?.totalSessions ?? 0)}</div>
                </div>
                <div style={S.kpiBox}>
                  <div style={S.kpiLabel}>今日</div>
                  <div style={S.kpiValue}>{Number(detail.progress?.todaySessions ?? 0)}</div>
                </div>
                <div style={S.kpiBox}>
                  <div style={S.kpiLabel}>streak</div>
                  <div style={S.kpiValue}>{Number(detail.progress?.streak ?? 0) || "—"}</div>
                </div>
                <div style={S.kpiBox}>
                  <div style={S.kpiLabel}>best</div>
                  <div style={S.kpiValue}>{Number(detail.progress?.bestStreak ?? 0) || "—"}</div>
                </div>
              </div>
            </div>

            {/* mini chart */}
            <div style={S.modalCard}>
              <div style={S.cardTitle}>直近5回の正答率</div>

              {detail.results.length === 0 ? (
                <div style={{ opacity: 0.7, fontSize: 13, paddingTop: 6 }}>
                  まだ記録がありません。
                </div>
              ) : (
                <div style={S.barWrap}>
                  {detail.results
                    .slice()
                    .reverse() // 古い→新しい
                    .map((r, i) => {
                      const acc = calcAcc(r)
                      return (
                        <div key={i} style={S.barCol}>
                          <div
                            style={{
                              ...S.bar,
                              height: `${clamp(acc, 0, 100)}%`,
                            }}
                            title={`${acc}%`}
                          />
                          <div style={S.barLabel}>{acc}%</div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* list */}
            <div style={S.modalCard}>
              <div style={S.cardTitle}>記録</div>
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {detail.results.length === 0 ? (
                  <div style={{ opacity: 0.7, fontSize: 13 }}>
                    まだ記録がありません。
                  </div>
                ) : (
                  detail.results.map((r, idx) => {
                    const d = toDate(r.createdAt)
                    const acc = calcAcc(r)
                    return (
                      <div key={idx} style={S.rowCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={S.rowTitle}>
                              {r.mode ? `mode: ${r.mode}` : "mode: —"}
                            </div>
                            <div style={S.rowSub}>{d ? fmtDate(d) : ""}</div>
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
                  })
                )}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  style={S.smallBtn}
                  onClick={() => router.push(`/select-mode?type=${detail.quizType ?? ""}`)}
                >
                  この教材で開始
                </button>
                <button style={S.smallGhostBtn} onClick={closeDetail}>
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </>
      )}
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
    display: "grid",
    gridTemplateColumns: "40px 1fr 40px",
    alignItems: "center",
    padding: "0 10px",
    background: "rgba(255,255,255,.92)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(17,24,39,.08)",
  },
  leftSlot: { width: 40, height: 40 },
  topbarTitle: { fontWeight: 900, fontSize: 14, textAlign: "center" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,.12)",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    justifySelf: "end",
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
  cardHeadRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  bigNumber: { fontSize: 28, fontWeight: 900, marginTop: 8 },
  miniNote: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  rowCard: {
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(17,24,39,.10)",
    background: "rgba(249,250,251,1)",
  },
  compactRow: {
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(17,24,39,.10)",
    background: "rgba(249,250,251,1)",
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
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

  // modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    zIndex: 70,
  },
  modal: {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(720px, 92vw)",
    maxHeight: "86vh",
    overflow: "auto",
    background: "#fff",
    border: "1px solid rgba(17,24,39,.10)",
    borderRadius: 18,
    boxShadow: "0 18px 50px rgba(0,0,0,.18)",
    zIndex: 80,
    padding: 14,
  },
  modalHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 10,
    borderBottom: "1px solid rgba(17,24,39,.08)",
  },
  modalTitle: {
    fontWeight: 900,
    fontSize: 16,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  modalSub: { marginTop: 2, fontSize: 12, opacity: 0.75 },

  modalCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(17,24,39,.10)",
    background: "rgba(249,250,251,1)",
  },

  kpiBox: {
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(17,24,39,.10)",
    background: "#fff",
  },
  kpiLabel: { fontSize: 12, opacity: 0.75, fontWeight: 800 },
  kpiValue: { fontSize: 18, fontWeight: 900, marginTop: 2 },

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
}