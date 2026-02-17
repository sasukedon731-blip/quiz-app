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
  const [billingStatus, setBillingStatus] =
    useState<"pending" | "active" | "past_due" | "canceled">("active")

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
      <main style={styles.page} className="mobile-page">
        <div style={styles.shell} className="mobile-shell">
          <div style={styles.skeletonCard}>読み込み中...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page} className="mobile-page">
      <div style={styles.shell} className="mobile-shell">

        {/* Header */}
        <header style={styles.header} className="mobile-header">
          <div>
            <h1 style={styles.h1}>学習を始める</h1>
            <p style={styles.sub}>
              {displayName ? <b>{displayName}</b> : ""} ・
              プラン：<b>{PLAN_LABEL[plan]}</b>
            </p>
          </div>

          <div style={styles.headerActions} className="mobile-header-actions">
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

        {error && <div style={styles.alert}>{error}</div>}

        {/* 通常・模擬・復習 */}
        <section style={{ marginTop: 14 }}>
          <h2 style={styles.h2}>あなたの教材</h2>

          {selectedCards.length === 0 ? (
            <div style={styles.card}>
              教材が選択されていません。
            </div>
          ) : (
            <div style={styles.grid} className="mobile-grid">
              {selectedCards.map((id) => {
                const q = quizzes[id]
                return (
                  <div key={id} style={styles.quizCard}>
                    <div style={styles.quizTitle}>{q.title}</div>
                    <div style={styles.quizDesc}>{q.description}</div>

                    <div style={styles.quizActions} className="mobile-quiz-actions">
                      <Link href={`/normal?type=${id}`} style={{ ...styles.btn, ...styles.btnBlue }}>
                        通常
                      </Link>
                      <Link href={`/exam?type=${id}`} style={{ ...styles.btn, ...styles.btnGray }}>
                        模擬
                      </Link>
                      <Link href={`/review?type=${id}`} style={{ ...styles.btn, ...styles.btnGreen }}>
                        復習
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 🎮 ゲーム（固定1本） */}
        <section style={{ marginTop: 24 }}>
          <h2 style={styles.h2}>ゲームで学ぶ</h2>

          <div style={styles.quizCard}>
            <div style={styles.quizTitle}>
              落ち物ネプリーグ（日本語検定 N4）
            </div>
            <div style={styles.quizDesc}>
              ゲームは1つに固定。日本語検定N4の問題を使用します。
            </div>

            <div style={styles.quizActions} className="mobile-quiz-actions">
              <Link href={`/game?mode=normal`} style={{ ...styles.btn, ...styles.btnBlue }}>
                ノーマル
              </Link>
              <Link href={`/game?mode=attack`} style={{ ...styles.btn, ...styles.btnGray }}>
                アタック
              </Link>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerNote}>
            ※ ゲームは日本語検定（N4）固定です。
          </div>
        </footer>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: 18 },
  shell: { maxWidth: 920, margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerActions: { display: "flex", gap: 10 },
  h1: { margin: 0, fontSize: 24 },
  h2: { margin: "10px 0" },
  sub: { margin: 0, opacity: 0.8 },
  alert: { background: "#fee2e2", padding: 10, borderRadius: 8 },
  card: { background: "#fff", padding: 16, borderRadius: 12 },
  grid: { display: "grid", gap: 12 },
  quizCard: {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  quizTitle: { fontWeight: 800, marginBottom: 6 },
  quizDesc: { fontSize: 13, opacity: 0.8, marginBottom: 10 },
  quizActions: { display: "grid", gap: 8 },
  btn: {
    padding: "10px 12px",
    borderRadius: 8,
    color: "#fff",
    textDecoration: "none",
    textAlign: "center",
    fontWeight: 800,
  },
  btnBlue: { background: "#2563eb" },
  btnGreen: { background: "#16a34a" },
  btnGray: { background: "#111827" },
  footer: { marginTop: 24 },
  footerNote: { fontSize: 12, opacity: 0.6 },
}
