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

// =======================
// ✅ 業種（マイページ最適化）
// =======================
type IndustryId = "construction" | "manufacturing" | "care" | "driver" | "undecided"

const INDUSTRY_LABEL: Record<IndustryId, string> = {
  construction: "建設",
  manufacturing: "製造",
  care: "介護",
  driver: "運転・免許",
  undecided: "未定（海外から）",
}

function isIndustryId(v: any): v is IndustryId {
  return (
    v === "construction" ||
    v === "manufacturing" ||
    v === "care" ||
    v === "driver" ||
    v === "undecided"
  )
}

const LS_INDUSTRY_KEY = "selected-industry"

const JAPANESE_BASE: QuizType[] = [
  "japanese-n4",
  "japanese-n3",
  "japanese-n2",
  "speaking-practice",
]

const INDUSTRY_EXTRA: Record<IndustryId, QuizType[]> = {
  construction: [
    "genba-listening",
    "genba-phrasebook",
    "kenchiku-sekou-2kyu-1ji",
    "doboku-sekou-2kyu-1ji",
    "denki-sekou-2kyu-1ji",
    "kanko-sekou-2kyu-1ji",
  ],
  manufacturing: ["genba-listening", "genba-phrasebook"],
  care: [],
  driver: ["gaikoku-license"],
  undecided: [],
}

function buildAllowed(industry: IndustryId | null): Set<string> {
  if (!industry) return new Set()
  const extra = INDUSTRY_EXTRA[industry] ?? []
  return new Set<string>([...JAPANESE_BASE, ...extra])
}

export default function MyPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ✅ ここが追加：ユーザーの業種（Firestore優先、無ければ localStorage）
  const [industry, setIndustry] = useState<IndustryId | null>(null)
  const [showAllCards, setShowAllCards] = useState(false)

  const withIndustry = (path: string) => {
    if (!industry) return path
    const join = path.includes("?") ? "&" : "?"
    return `${path}${join}industry=${encodeURIComponent(industry)}`
  }

  // ✅ インデックス不要にするため、結果をまとめて持つ（直近N件）
  const [allResults, setAllResults] = useState<QuizResult[]>([])

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
  const [detailTargetId, setDetailTargetId] = useState<string | null>(null)

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

  // ✅ 業種ロード（Firestore → localStorage fallback）
  useEffect(() => {
    ;(async () => {
      if (!user?.uid) return
      try {
        const userRef = doc(db, "users", user.uid)
        const snap = await getDoc(userRef)
        const v = snap.exists() ? (snap.data() as any)?.industry : null
        if (isIndustryId(v)) {
          setIndustry(v)
          try {
            localStorage.setItem(LS_INDUSTRY_KEY, v)
          } catch {}
          return
        }
      } catch {
        // ignore
      }

      // fallback
      try {
        const saved = localStorage.getItem(LS_INDUSTRY_KEY)
        if (isIndustryId(saved)) {
          setIndustry(saved)
        }
      } catch {}
    })()
  }, [user?.uid])

  // Load summary
  useEffect(() => {
    ;(async () => {
      if (!user?.uid) return
      setLoading(true)
      setError("")
      try {
        const resultsRef = collection(db, "users", user.uid, "results")

        // ✅ 直近200件まとめて取得（orderByだけなら単一インデックスでOK）
        const qAll = query(resultsRef, orderBy("createdAt", "desc"), limit(200))
        const snapAll = await getDocs(qAll)

        const all: QuizResult[] = snapAll.docs.map((d) => {
          const data = d.data() as any
          return {
            score: Number(data.score ?? 0),
            total: Number(data.total ?? 0),
            accuracy: typeof data.accuracy === "number" ? data.accuracy : undefined,
            quizType: data.quizType ?? undefined,
            mode: data.mode ?? undefined,
            createdAt: data.createdAt ?? null,
          }
        })

        setAllResults(all)

        // global latest 5
        setLatestResults(all.slice(0, 5))

        // latest by quizType
        const byQuiz: Record<string, QuizResult | null> = {}
        for (const r of all) {
          const qt = String(r.quizType ?? "")
          if (!qt) continue
          if (byQuiz[qt] == null) byQuiz[qt] = r
        }
        setLatestByQuiz(byQuiz)

        // progress map
        const prog: Record<string, Progress> = {}
        await Promise.all(
          quizCatalog.map(async (q) => {
            try {
              const pRef = doc(db, "users", user.uid, "progress", q.id)
              const pSnap = await getDoc(pRef)
              if (pSnap.exists()) {
                prog[q.id] = (pSnap.data() as any) ?? {}
              } else {
                prog[q.id] = {}
              }
            } catch {
              prog[q.id] = {}
            }
          })
        )
        setProgressMap(prog)
      } catch (e) {
        console.error(e)
        setError("読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.uid])

  const openDetail = async (quizType: string, title: string) => {
    if (!user?.uid) return
    setDetailLoading(true)
    setDetailTargetId(quizType)
    try {
      const resultsRef = collection(db, "users", user.uid, "results")
      const qOne = query(
        resultsRef,
        orderBy("createdAt", "desc"),
        limit(50)
      )
      const snap = await getDocs(qOne)
      const list = snap.docs
        .map((d) => d.data() as any)
        .filter((x) => String(x.quizType ?? "") === quizType)
        .slice(0, 5)
        .map((x) => ({
          score: Number(x.score ?? 0),
          total: Number(x.total ?? 0),
          accuracy: typeof x.accuracy === "number" ? x.accuracy : undefined,
          quizType: x.quizType ?? undefined,
          mode: x.mode ?? undefined,
          createdAt: x.createdAt ?? null,
        }))

      const pRef = doc(db, "users", user.uid, "progress", quizType)
      const pSnap = await getDoc(pRef)
      const prog = pSnap.exists() ? ((pSnap.data() as any) ?? {}) : null

      setDetail({
        open: true,
        quizType,
        title,
        results: list,
        progress: prog,
      })
    } catch (e) {
      console.error(e)
      setError("詳細の取得に失敗しました")
    } finally {
      setDetailLoading(false)
      setDetailTargetId(null)
    }
  }

  const closeDetail = () => {
    setDetail((d) => ({ ...d, open: false }))
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } finally {
      router.push("/")
    }
  }

  // ✅ マイページ教材カード：業種で絞り込み（日本語基礎は必ず含む）
  const allowedSet = useMemo(() => buildAllowed(industry), [industry])

  const visibleCatalog = useMemo(() => {
    const enabled = quizCatalog.filter((q) => q.enabled).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    if (!industry || showAllCards) return enabled
    return enabled.filter((q) => allowedSet.has(q.id))
  }, [industry, showAllCards, allowedSet])

  const totalSessionsAll = useMemo(() => {
    return Object.values(progressMap).reduce((sum, p) => sum + Number(p.totalSessions ?? 0), 0)
  }, [progressMap])

  const streakMax = useMemo(() => {
    const all = Object.values(progressMap).map((p) => Number(p.bestStreak ?? 0))
    return all.length ? Math.max(...all) : 0
  }, [progressMap])

  const latestAcc = useMemo(() => {
    const r = latestResults[0]
    return r ? calcAcc(r) : null
  }, [latestResults])

  if (loading) {
    return (
      <main style={S.page}>
        <div style={S.wrap}>
          <div style={S.card}>読み込み中...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={S.page}>
      {/* Drawer overlay */}
      {drawerOpen ? <div style={S.drawerOverlay} onClick={() => setDrawerOpen(false)} /> : null}

      {/* Drawer */}
      {drawerOpen ? (
        <aside style={S.drawer} aria-label="menu" onClick={(e) => e.stopPropagation()}>
          <div style={S.drawerHead}>
            <div style={{ fontWeight: 900 }}>メニュー</div>
            <button style={S.drawerClose} onClick={() => setDrawerOpen(false)} type="button">
              ✕
            </button>
          </div>

          <nav style={S.nav}>
            <Link style={S.navItem} href="/" onClick={() => setDrawerOpen(false)}>
              🏠 TOPへ
            </Link>

            <Link style={S.navItem} href="/mypage" onClick={() => setDrawerOpen(false)}>
              👤 マイページ
            </Link>

            {/* ✅ ここは業種を維持して select-mode へ */}
            <Link style={S.navItem} href={withIndustry("/select-mode")} onClick={() => setDrawerOpen(false)}>
              🎮 学習を始める
            </Link>

            <Link style={S.navItem} href={withIndustry("/plans")} onClick={() => setDrawerOpen(false)}>
              💳 プラン
            </Link>

            <Link style={S.navItem} href="/contents" onClick={() => setDrawerOpen(false)}>
              📚 教材一覧
            </Link>

            <div style={S.divider} />

            <button style={S.dangerBtn} onClick={handleLogout}>
              ログアウト
            </button>
          </nav>
        </aside>
      ) : null}

      <div style={S.wrap}>
        {/* Header */}
        <header style={S.header}>
          <div style={S.brand}>
            <div style={S.logo}>📚</div>
            <div>
              <div style={S.brandName}>マイページ</div>
              <div style={S.brandSub}>進捗・履歴・教材一覧</div>
            </div>
          </div>

          <button style={S.burgerBtn} onClick={() => setDrawerOpen(true)} type="button" aria-label="menu">
            ☰
          </button>
        </header>

        {error ? <div style={S.alert}>{error}</div> : null}


        {/* 🏆 アタック戦績（自分） */}
        <section style={S.card}>
          <div style={S.cardHeadRow}>
            <div style={S.cardTitle}>🏆 アタック戦績</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>右上🏆から順位確認</div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
            {[
              { id: "tile-drop", label: "🔨 文字ブレイク" },
              { id: "flash-judge", label: "⚡ 瞬判ジャッジ" },
              { id: "memory-burst", label: "🧠 フラッシュ記憶" },
            ].map((g) => (
              <div key={g.id} style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
                <div style={{ fontWeight: 900, fontSize: 12 }}>{g.label}</div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75, lineHeight: 1.4 }}>
                  アタックで記録更新<br />
                  ゲーム画面右上🏆で順位
                </div>
                <Link href={`/game?type=japanese-n4&kind=${g.id}&mode=attack`} style={{ display: "inline-block", marginTop: 10, fontWeight: 900 }}>
                  アタック →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ 業種表示カード */}
        <section style={S.card}>
          <div style={S.cardHeadRow}>
            <div style={S.cardTitle}>あなたの設定</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                style={S.linkBtn}
                onClick={() => router.push(withIndustry("/select-quizzes"))}
                title="教材選択へ"
              >
                教材を変更 →
              </button>

              {/* ✅ 業種で絞る/全部表示 */}
              <button
                style={S.linkBtn}
                onClick={() => setShowAllCards((v) => !v)}
                title="教材カードの表示切替"
              >
                {showAllCards ? "業種で絞る" : "すべて表示"}
              </button>
            </div>
          </div>

          <div style={S.kvRow}>
            <div style={S.kv}>
              <div style={S.kvLabel}>選択中の業種</div>
              <div style={S.kvValue}>{industry ? INDUSTRY_LABEL[industry] : "未設定"}</div>
              <div style={S.kvHint}>
                {industry
                  ? "マイページの教材カードは業種で最適化されています（日本語基礎は常に表示）"
                  : "業種を選ぶと、教材カードが最適化されます"}
              </div>
            </div>

            <div style={S.kv}>
              <div style={S.kvLabel}>総学習回数</div>
              <div style={S.kvValue}>{totalSessionsAll}</div>
              <div style={S.kvHint}>全教材合計</div>
            </div>

            <div style={S.kv}>
              <div style={S.kvLabel}>最新の合格率</div>
              <div style={S.kvValue}>{latestAcc === null ? "—" : `${latestAcc}%`}</div>
              <div style={S.kvHint}>直近の結果</div>
            </div>

            <div style={S.kv}>
              <div style={S.kvLabel}>最大streak</div>
              <div style={S.kvValue}>{streakMax || "—"}</div>
              <div style={S.kvHint}>教材別の最大streak</div>
            </div>
          </div>
        </section>

        {/* 教材カード：業種で最適化 */}
        <section style={S.card}>
          <div style={S.cardHeadRow}>
            <div style={S.cardTitle}>教材</div>
            <button style={S.linkBtn} onClick={() => router.push("/contents")}>
              教材一覧 →
            </button>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {visibleCatalog.map((q) => {
              const p = progressMap[q.id] ?? {}
              const last = latestByQuiz[q.id] ?? null

              const totalSessions = Number(p.totalSessions ?? 0)
              const streak = Number(p.streak ?? 0)
              const lastAcc = last ? calcAcc(last as any) : null

              const isThisLoading = detailLoading && detailTargetId === q.id

              return (
                <div key={q.id} style={S.compactRow}>
                  <div style={{ minWidth: 0 }}>
                    <div style={S.rowTitle}>{q.title}</div>
                    <div style={S.rowSub}>
                      {lastAcc === null ? "最新：—" : `最新：${lastAcc}%`} ・ 総回数：{totalSessions} ・ streak：
                      {streak || "—"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      style={S.smallGhostBtn}
                      onClick={() => openDetail(q.id, q.title)}
                      disabled={detailLoading}
                    >
                      {isThisLoading ? "読込中..." : "詳細"}
                    </button>

                    {/* ✅ 開始：select-modeへ。industryを維持 + typeも残す */}
                    <button
                      style={S.smallBtn}
                      onClick={() =>
                        router.push(
                          industry
                            ? `/select-mode?industry=${encodeURIComponent(industry)}&type=${encodeURIComponent(q.id)}`
                            : `/select-mode?type=${encodeURIComponent(q.id)}`
                        )
                      }
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
            <div style={S.cardTitle}>最新の結果（直近5件）</div>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {latestResults.length === 0 ? (
              <div style={S.miniNote}>まだ結果がありません。</div>
            ) : (
              latestResults.map((r, i) => {
                const qt = String(r.quizType ?? "")
                const title = titleByQuizType(qt)
                const d = toDate(r.createdAt)
                const acc = calcAcc(r)
                return (
                  <div key={i} style={S.resultRow}>
                    <div style={{ minWidth: 0 }}>
                      <div style={S.resultTitle}>{title}</div>
                      <div style={S.resultSub}>
                        {d ? fmtDate(d) : "—"} ・ {r.score}/{r.total} ・ {acc}%
                      </div>
                    </div>
                    <div style={S.resultPill}>{r.mode ?? "—"}</div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Detail modal */}
        {detail.open ? (
          <div style={S.modalOverlay} onClick={closeDetail}>
            <div style={S.modal} onClick={(e) => e.stopPropagation()}>
              <div style={S.modalHead}>
                <div style={{ fontWeight: 900 }}>{detail.title}</div>
                <button style={S.modalClose} onClick={closeDetail} type="button">
                  ✕
                </button>
              </div>

              <div style={S.modalBody}>
                <div style={S.modalGrid}>
                  <div style={S.modalCard}>
                    <div style={S.modalLabel}>総回数</div>
                    <div style={S.modalValue}>
                      {Number(detail.progress?.totalSessions ?? 0)}
                    </div>
                  </div>
                  <div style={S.modalCard}>
                    <div style={S.modalLabel}>今日</div>
                    <div style={S.modalValue}>
                      {Number(detail.progress?.todaySessions ?? 0)}
                    </div>
                  </div>
                  <div style={S.modalCard}>
                    <div style={S.modalLabel}>streak</div>
                    <div style={S.modalValue}>
                      {Number(detail.progress?.streak ?? 0)}
                    </div>
                  </div>
                  <div style={S.modalCard}>
                    <div style={S.modalLabel}>best</div>
                    <div style={S.modalValue}>
                      {Number(detail.progress?.bestStreak ?? 0)}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>直近5件</div>
                  {detail.results.length === 0 ? (
                    <div style={S.miniNote}>まだ結果がありません。</div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {detail.results.map((r, idx) => {
                        const d = toDate(r.createdAt)
                        const acc = calcAcc(r)
                        return (
                          <div key={idx} style={S.resultRow}>
                            <div style={{ minWidth: 0 }}>
                              <div style={S.resultTitle}>
                                {d ? fmtDate(d) : "—"}
                              </div>
                              <div style={S.resultSub}>
                                {r.score}/{r.total} ・ {acc}%
                              </div>
                            </div>
                            <div style={S.resultPill}>{r.mode ?? "—"}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: 18 },
  wrap: { maxWidth: 980, margin: "0 auto" },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  brand: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "#111827",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
  },
  brandName: { fontWeight: 900, fontSize: 16 },
  brandSub: { opacity: 0.7, fontSize: 12 },

  burgerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
  },

  alert: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    fontWeight: 800,
  },

  card: {
    marginTop: 12,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
  cardHeadRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  cardTitle: { fontWeight: 900, fontSize: 16 },

  linkBtn: {
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },

  kvRow: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
  },
  kv: {
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    borderRadius: 16,
    padding: 12,
  },
  kvLabel: { fontSize: 12, opacity: 0.7, fontWeight: 900 },
  kvValue: { marginTop: 6, fontSize: 22, fontWeight: 900 },
  kvHint: { marginTop: 6, fontSize: 12, opacity: 0.75, lineHeight: 1.5 },

  compactRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    background: "#fff",
  },
  rowTitle: { fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  rowSub: { marginTop: 4, fontSize: 12, opacity: 0.75 },

  smallBtn: {
    border: "none",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 900,
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
  smallGhostBtn: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 900,
    background: "#fff",
    cursor: "pointer",
  },

  miniNote: { fontSize: 12, opacity: 0.7 },

  resultRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    background: "#f9fafb",
  },
  resultTitle: { fontWeight: 900, fontSize: 13 },
  resultSub: { marginTop: 4, fontSize: 12, opacity: 0.75 },
  resultPill: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#111827",
    color: "white",
    fontWeight: 900,
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  // Drawer
  drawerOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000 },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "min(320px, 86vw)",
    height: "100vh",
    background: "#fff",
    zIndex: 1001,
    padding: 16,
    boxShadow: "-6px 0 22px rgba(0,0,0,0.18)",
  },
  drawerHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  drawerClose: {
    width: 40,
    height: 40,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 900,
  },
  nav: { display: "flex", flexDirection: "column", gap: 10 },
  navItem: {
    textDecoration: "none",
    color: "#111",
    fontWeight: 900,
    padding: "10px 10px",
    borderRadius: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  divider: { height: 1, background: "#e5e7eb", margin: "6px 0" },
  dangerBtn: {
    border: "none",
    borderRadius: 14,
    padding: "12px 12px",
    fontWeight: 900,
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
  },

  // Modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 2000, display: "grid", placeItems: "center", padding: 14 },
  modal: { width: "min(720px, 92vw)", background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", boxShadow: "0 18px 48px rgba(0,0,0,0.20)" },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottom: "1px solid #e5e7eb" },
  modalClose: { width: 40, height: 40, borderRadius: 14, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 900 },
  modalBody: { padding: 14 },
  modalGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 },
  modalCard: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, background: "#f9fafb" },
  modalLabel: { fontSize: 12, opacity: 0.7, fontWeight: 900 },
  modalValue: { marginTop: 6, fontSize: 22, fontWeight: 900 },

      {
}