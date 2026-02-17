"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { auth } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import type { PlanId } from "@/app/lib/plan"
import { loadAndRepairUserPlanState } from "@/app/lib/userPlanState"
import { assertActiveAccess } from "@/app/lib/guards"

const PLAN_LABEL: Record<PlanId, string> = {
  trial: "お試し（無料）",
  free: "無料",
  "3": "3教材プラン",
  "5": "5教材プラン",
  all: "ALLプラン",
}

// ✅ ゲームは「1つ」に固定（日本語N4）
const GAME_FIXED_TYPE: QuizType = "japanese-n4"

export default function SelectModePage() {
  const router = useRouter()

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [billingStatus, setBillingStatus] = useState<"pending" | "active" | "past_due" | "canceled">("active")

  const [plan, setPlan] = useState<PlanId>("trial")
  const [selected, setSelected] = useState<QuizType[]>([])
  const [displayName, setDisplayName] = useState("")

  // ✅ Mobile判定（SSR安全 / hook順序崩さない）
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener?.("change", apply)
    return () => mq.removeEventListener?.("change", apply)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login")
        return
      }
      setUid(u.uid)
    })
    return () => unsub()
  }, [router])

  useEffect(() => {
    ;(async () => {
      if (!uid) return
      setLoading(true)
      setError("")
      setAccessBlocked(false)
      try {
        const gate = await assertActiveAccess(uid)
        setBillingStatus(gate.billingStatus)
        if (!gate.ok) {
          setAccessBlocked(true)
          setLoading(false)
          return
        }
        const state = await loadAndRepairUserPlanState(uid)
        setPlan(state.plan)
        setSelected(state.selectedQuizTypes)
        setDisplayName(state.displayName || "")
      } catch (e) {
        console.error(e)
        setError("読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [uid])

  const selectedCards = useMemo(() => {
    return selected.filter((q) => quizzes[q])
  }, [selected])

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          {accessBlocked ? (
            <div style={styles.payWarn}>
              <div style={{ fontWeight: 900 }}>利用開始にはお支払い手続きが必要です</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                状態：<b>{billingStatus}</b>（コンビニ払いは入金確認後に利用可能になります）
              </div>
              <div style={{ marginTop: 10 }}>
                <button onClick={() => router.push("/plans")} style={{ ...styles.btn, ...styles.btnMain }}>
                  プラン / 支払いへ
                </button>
              </div>
            </div>
          ) : null}

          <div style={styles.skeletonCard}>読み込み中...</div>
        </div>
      </main>
    )
  }

  // ✅ TSが "string" に widen するのを防ぐため、明示的に型を付ける
  const shellStyle: React.CSSProperties = isMobile ? { ...styles.shell, maxWidth: 560, padding: 12 } : styles.shell

  const headerStyle: React.CSSProperties = isMobile
    ? { ...styles.header, flexDirection: "column" as const, alignItems: "stretch" as const }
    : styles.header

  const headerActionsStyle: React.CSSProperties = isMobile
    ? {
        ...styles.headerActions,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        justifyContent: "stretch",
      }
    : styles.headerActions

  const gridStyle: React.CSSProperties = isMobile
    ? { ...styles.grid, gridTemplateColumns: "1fr", gap: 12 }
    : styles.grid

  const btnStyle: React.CSSProperties = isMobile
    ? { ...styles.btn, padding: "14px 14px", borderRadius: 16, fontSize: 16 }
    : styles.btn

  const quizActionsStyle: React.CSSProperties = isMobile ? { ...styles.quizActions, gap: 10 } : styles.quizActions

  return (
    <main style={styles.page}>
      <div style={shellStyle}>
        {accessBlocked ? (
          <div style={styles.payWarn}>
            <div style={{ fontWeight: 900 }}>利用開始にはお支払い手続きが必要です</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
              状態：<b>{billingStatus}</b>（コンビニ払いは入金確認後に利用可能になります）
            </div>
            <div style={{ marginTop: 10 }}>
              <button onClick={() => router.push("/plans")} style={{ ...btnStyle, ...styles.btnMain }}>
                プラン / 支払いへ
              </button>
            </div>
          </div>
        ) : null}

        {/* Header */}
        <header style={headerStyle}>
          <div>
            <h1 style={{ ...styles.h1, fontSize: isMobile ? 22 : 26 }}>学習を始める</h1>
            <p style={styles.sub}>
              {displayName ? (
                <>
                  <b>{displayName}</b> さん ・
                </>
              ) : null}{" "}
              プラン：<b>{PLAN_LABEL[plan] ?? plan}</b>
            </p>
          </div>

          <div style={headerActionsStyle}>
            <Link href="/mypage" style={{ ...btnStyle, ...styles.btnGray }}>
              マイページ
            </Link>
            <Link href="/plans" style={{ ...btnStyle, ...styles.btnBlue }}>
              プラン変更
            </Link>
            <Link href="/select-quizzes" style={{ ...btnStyle, ...styles.btnGreen }}>
              教材選択
            </Link>
          </div>
        </header>

        {error ? <div style={styles.alert}>{error}</div> : null}

        {/* Empty */}
        {selectedCards.length === 0 ? (
          <section style={styles.card}>
            <div style={styles.cardTitle}>教材が選択されていません</div>
            <p style={styles.cardText}>
              まずは今月受講する教材を選びましょう。選択後、この画面から「通常 / 模擬 / 復習」を開始できます。
            </p>

            <div style={styles.row}>
              <Link href="/select-quizzes" style={{ ...btnStyle, ...styles.btnGreen }}>
                教材を選ぶ
              </Link>
              <Link href="/plans" style={{ ...btnStyle, ...styles.btnBlue }}>
                プランを確認
              </Link>
            </div>
          </section>
        ) : (
          <section style={{ marginTop: 14 }}>
            <div style={styles.sectionHead}>
              <h2 style={styles.h2}>あなたの教材（今月の受講）</h2>
              <span style={styles.badge}>{selectedCards.length} 件</span>
            </div>

            <div style={gridStyle}>
              {selectedCards.map((id) => {
                const q = quizzes[id]
                return (
                  <div key={id} style={styles.quizCard}>
                    <div style={styles.quizTitle}>{q.title}</div>

                    {q.description ? (
                      <div style={styles.quizDesc}>{q.description}</div>
                    ) : (
                      <div style={styles.quizDescMuted}>（説明なし）</div>
                    )}

                    <div style={styles.quizMeta}>ID: {id}</div>

                    <div style={quizActionsStyle}>
                      <Link href={`/normal?type=${id}`} style={{ ...btnStyle, ...styles.btnBlue }}>
                        通常
                      </Link>
                      <Link href={`/exam?type=${id}`} style={{ ...btnStyle, ...styles.btnGray }}>
                        模擬試験
                      </Link>
                      <Link href={`/review?type=${id}`} style={{ ...btnStyle, ...styles.btnGreen }}>
                        復習
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ✅ Game entry（1つに固定） */}
        <section style={{ marginTop: 16 }}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>ゲームで学ぶ</h2>
            <span style={styles.badge}>NEW</span>
          </div>

          <div style={styles.quizCard}>
            <div style={styles.quizTitle}>落ち物ネプリーグ（日本語検定 N4）</div>
            <div style={styles.quizDesc}>
              ゲームは1つに固定（日本語N4）。通常/模擬/復習は教材ごとに今まで通り使えます。
            </div>
            <div style={styles.quizMeta}>ID: {GAME_FIXED_TYPE}</div>
            <div style={quizActionsStyle}>
              <Link href={`/game?mode=normal`} style={{ ...btnStyle, ...styles.btnBlue }}>
                ノーマル
              </Link>
              <Link href={`/game?mode=attack`} style={{ ...btnStyle, ...styles.btnGray }}>
                アタック
              </Link>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerNote}>
            ※ ゲームは日本語検定（N4）固定です。スマホでは「1カラム＆大きめボタン」になります。
          </div>
        </footer>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: 18,
  },
  shell: {
    maxWidth: 920,
    margin: "0 auto",
    padding: 0,
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  h1: { margin: 0, fontSize: 26, letterSpacing: 0.2 },
  h2: { margin: 0, fontSize: 18 },
  sub: { margin: "6px 0 0", opacity: 0.78 },

  alert: {
    marginTop: 10,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    fontWeight: 800,
  },

  skeletonCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },

  card: {
    marginTop: 12,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
  cardTitle: { fontSize: 16, fontWeight: 900 },
  cardText: { marginTop: 8, opacity: 0.85, lineHeight: 1.6 },
  row: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },

  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  badge: {
    fontSize: 12,
    fontWeight: 900,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
    alignItems: "stretch",
  },

  quizCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 240,
  },
  quizTitle: { fontWeight: 900, fontSize: 16 },

  quizDesc: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.85,
    lineHeight: 1.5,
    minHeight: 48,
  },
  quizDescMuted: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.55,
    minHeight: 48,
  },

  quizMeta: { marginTop: 8, fontSize: 12, opacity: 0.6 },

  quizActions: {
    marginTop: "auto",
    display: "grid",
    gap: 8,
  },

  btn: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 14,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
    textAlign: "center",
    border: "none",
  },
  btnBlue: { background: "#2563eb" },
  btnGreen: { background: "#16a34a" },
  btnGray: { background: "#111827" },
  btnMain: { background: "#111827" },

  payWarn: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #f59e0b",
    background: "#fffbeb",
  },

  footer: { marginTop: 16, paddingTop: 8 },
  footerNote: { fontSize: 12, opacity: 0.65 },
}
