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
          <div style={{ marginBottom: 12, padding: 12, borderRadius: 14, border: "1px solid #f59e0b", background: "#fffbeb" }}>
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

  return (
    <main style={styles.page}>
      <div style={styles.shell}>

        {accessBlocked ? (
          <div style={{ marginBottom: 12, padding: 12, borderRadius: 14, border: "1px solid #f59e0b", background: "#fffbeb" }}>
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

        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>学習を始める</h1>
            <p style={styles.sub}>
              {displayName ? (
                <>
                  <b>{displayName}</b> さん ・
                </>
              ) : null}{" "}
              プラン：<b>{PLAN_LABEL[plan] ?? plan}</b>
            </p>
          </div>

          <div style={styles.headerActions}>
            <Link href="/mypage" style={{ ...styles.btn, ...styles.btnGray }}>
              マイページ
            </Link>
            <Link href="/plans" style={{ ...styles.btn, ...styles.btnBlue }}>
              プラン変更
            </Link>
            <Link href="/select-quizzes" style={{ ...styles.btn, ...styles.btnGreen }}>
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
              <Link href="/select-quizzes" style={{ ...styles.btn, ...styles.btnGreen }}>
                教材を選ぶ
              </Link>
              <Link href="/plans" style={{ ...styles.btn, ...styles.btnBlue }}>
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

            <div style={styles.grid}>
              {selectedCards.map((id) => {
                const q = quizzes[id]
                return (
                  <div key={id} style={styles.quizCard}>
                    <div style={styles.quizTitle}>{q.title}</div>

                    {/* 説明文の有無に関係なく高さを確保 */}
                    {q.description ? (
                      <div style={styles.quizDesc}>{q.description}</div>
                    ) : (
                      <div style={styles.quizDescMuted}>（説明なし）</div>
                    )}

                    {/* ✅ IDはボタンより上へ（ボタン位置固定のため） */}
                    <div style={styles.quizMeta}>ID: {id}</div>

                    {/* ✅ ボタンは常にカード下部へ */}
                    <div style={styles.quizActions}>
                      <Link href={`/normal?type=${id}`} style={{ ...styles.btn, ...styles.btnBlue }}>
                        通常
                      </Link>
                      <Link href={`/exam?type=${id}`} style={{ ...styles.btn, ...styles.btnGray }}>
                        模擬試験
                      </Link>
                      <Link href={`/review?type=${id}`} style={{ ...styles.btn, ...styles.btnGreen }}>
                        復習
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ✅ Game entry */}
        <section style={{ marginTop: 16 }}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>ゲームで学ぶ</h2>
            <span style={styles.badge}>NEW</span>
          </div>

          {selectedCards.length === 0 ? (
            <div style={styles.quizCard}>
              <div style={styles.quizTitle}>落ち物ネプリーグ</div>
              <div style={styles.quizDesc}>まずは「教材選択」で教材を選んでください。</div>
              <div style={styles.quizActions}>
                <Link href="/select-quizzes" style={{ ...styles.btn, ...styles.btnGreen }}>
                  教材を選ぶ
                </Link>
              </div>
            </div>
          ) : (
            <div style={styles.grid}>
              {selectedCards.map((id) => {
                const q = quizzes[id]
                return (
                  <div key={`game-${id}`} style={styles.quizCard}>
                    <div style={styles.quizTitle}>落ち物ネプリーグ（{q.title}）</div>
                    <div style={styles.quizDesc}>
                      この教材の既存クイズを、そのままゲーム化（手入力なし）。
                    </div>
                    <div style={styles.quizMeta}>ID: {id}</div>
                    <div style={styles.quizActions}>
                      <Link href={`/game?type=${id}&mode=normal`} style={{ ...styles.btn, ...styles.btnBlue }}>
                        ノーマル
                      </Link>
                      <Link href={`/game?type=${id}&mode=attack`} style={{ ...styles.btn, ...styles.btnGray }}>
                        アタック
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerNote}>
            ※ 直リンクで不正な教材を開いた場合も、この画面へ戻る仕様になっています。
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
    minHeight: 240, // カードの最低高さ（好みで調整）
  },
  quizTitle: { fontWeight: 900, fontSize: 16 },

  // 説明文の最低高さを確保
  quizDesc: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.85,
    lineHeight: 1.5,
    minHeight: 48, // 2行ぶんくらい
  },
  quizDescMuted: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.55,
    minHeight: 48,
  },

  // IDはボタンより上に置く前提
  quizMeta: { marginTop: 8, fontSize: 12, opacity: 0.6 },

  // ボタンを常に最下部へ
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

  footer: { marginTop: 16, paddingTop: 8 },
  footerNote: { fontSize: 12, opacity: 0.65 },
}
