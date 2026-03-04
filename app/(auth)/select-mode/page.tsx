"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { auth } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import type { PlanId } from "@/app/lib/plan"
import { loadAndRepairUserPlanState } from "@/app/lib/userPlanState"
import { assertActiveAccess } from "@/app/lib/guards"
import AppHeader from "@/app/components/AppHeader"

const PLAN_LABEL: Record<PlanId, string> = {
  trial: "お試し（無料）",
  free: "無料",
  "3": "3教材プラン",
  "5": "5教材プラン",
  all: "ALLプラン",
}

const GAME_FIXED_TYPE: QuizType = "japanese-n4"

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

export default function SelectModePage() {
  const router = useRouter()
  const params = useSearchParams()

  let industry = (params.get("industry") as IndustryId | null) ?? null
  const [industryReady, setIndustryReady] = useState(false)

  // ✅ localStorage key
  const LS_INDUSTRY_KEY = "selected-industry"

  // ✅ URLに無ければ localStorage から復元してURLを正にする（導線途切れ防止）
  useEffect(() => {
    if (industry && isIndustryId(industry)) {
      try {
        localStorage.setItem(LS_INDUSTRY_KEY, industry)
      } catch {}
      setIndustryReady(true)
      return
    }

    try {
      const saved = localStorage.getItem(LS_INDUSTRY_KEY)
      if (saved && isIndustryId(saved)) {
        router.replace(`/select-mode?industry=${encodeURIComponent(saved)}`)
        return
      }
    } catch {}

    // 保存が無い場合でも画面は出す
    setIndustryReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const withIndustry = (path: string) => {
    if (!industry) return path
    const join = path.includes("?") ? "&" : "?"
    return `${path}${join}industry=${encodeURIComponent(industry)}`
  }

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [billingStatus, setBillingStatus] = useState<
    "pending" | "active" | "past_due" | "canceled"
  >("active")

  const [plan, setPlan] = useState<PlanId>("trial")
  const [selected, setSelected] = useState<QuizType[]>([])
  const [displayName, setDisplayName] = useState("")

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

  // ✅ 一覧を探しやすく：カードは「選択」、操作は下部バーに集約
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null)

  useEffect(() => {
    // 選択が無い/変わった時は先頭を自動選択
    if (!activeQuiz || (activeQuiz && !selectedCards.includes(activeQuiz))) {
      setActiveQuiz(selectedCards[0] ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCards.join(",")])

  if (!industryReady) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>読み込み中...</div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          {accessBlocked ? (
            <div style={styles.payWarn}>
              <div style={{ fontWeight: 900 }}>
                利用開始にはお支払い手続きが必要です
              </div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                状態：<b>{billingStatus}</b>
              </div>
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => router.push(withIndustry("/plans"))}
                  style={{ ...styles.btn, ...styles.btnMain }}
                >
                  プラン / 支払いへ
                </button>
              </div>
            </div>
          ) : null}

          <div style={styles.card}>読み込み中...</div>
        </div>
      </main>
    )
  }

  const shellStyle: React.CSSProperties = isMobile
    ? { ...styles.shell, maxWidth: 560, padding: 12 }
    : styles.shell

  const btnStyle: React.CSSProperties = isMobile
    ? { ...styles.btn, padding: "14px 14px", borderRadius: 16, fontSize: 16 }
    : styles.btn

  const gridStyle: React.CSSProperties = isMobile
    ? { ...styles.grid, gridTemplateColumns: "1fr", gap: 12 }
    : styles.grid

  const quizActionsStyle: React.CSSProperties = isMobile
    ? { ...styles.quizActions, gap: 10 }
    : styles.quizActions

  return (
    <main style={styles.page}>
      <div style={shellStyle}>
        {accessBlocked ? (
          <div style={styles.payWarn}>
            <div style={{ fontWeight: 900 }}>
              利用開始にはお支払い手続きが必要です
            </div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
              状態：<b>{billingStatus}</b>
            </div>
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => router.push(withIndustry("/plans"))}
                style={{ ...btnStyle, ...styles.btnMain }}
              >
                プラン / 支払いへ
              </button>
            </div>
          </div>
        ) : null}

        <AppHeader title="学習を始める" />

        <div
          style={{
            marginTop: 12,
            border: "1px solid var(--border)",
            borderRadius: 16,
            background: "white",
            padding: isMobile ? "12px 12px" : "14px 14px",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 14 }}>
            {displayName ? `${displayName} さん ・ ` : ""}
            プラン：{PLAN_LABEL[plan] ?? plan}
            {industry ? (
              <>
                {" "}
                ・ 業種：<span style={{ fontWeight: 900 }}>{INDUSTRY_LABEL[industry]}</span>
              </>
            ) : null}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            教材を選んで「通常 / 模擬 / 復習 / 日本語バトル」を開始できます。
          </div>
        </div>

        {error ? <div style={styles.alert}>{error}</div> : null}

        {selectedCards.length === 0 ? (
          <section style={styles.card}>
            <div style={styles.cardTitle}>教材が選択されていません</div>
            <p style={styles.cardText}>
              まずは今月受講する教材を選びましょう。選択後、この画面から
              「通常 / 模擬 / 復習」を開始できます。
            </p>

            <div style={styles.row}>
              <Link href={withIndustry("/select-quizzes")} style={{ ...btnStyle, ...styles.btnGreen }}>
                教材を選ぶ
              </Link>

              <Link href={withIndustry("/plans")} style={{ ...btnStyle, ...styles.btnBlue }}>
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
                  <div key={id} style={{...styles.quizCard, ...(activeQuiz === id ? styles.quizCardActive : {})}} role="button" tabIndex={0} onClick={() => setActiveQuiz(id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveQuiz(id) }}>
                    <div style={styles.quizTitle}>{q.title}</div>

                    {q.description ? (
                      <div style={styles.quizDesc}>{q.description}</div>
                    ) : (
                      <div style={styles.quizDescMuted}>（説明なし）</div>
                    )}

                    <div style={styles.quizMeta}>ID: {id}</div>
                  </div>
                )
              })}
            </div>

            {/* ✅ 下部固定：選んだ教材に対して操作する（探しやすい） */}
            {activeQuiz ? (
              <div style={styles.bottomBar}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  選択中：<span style={{ fontWeight: 900 }}>{quizzes[activeQuiz]?.title ?? activeQuiz}</span>
                </div>
                <div style={styles.bottomActions}>
                  <Link href={`/normal?type=${activeQuiz}`} style={{ ...btnStyle, ...styles.bottomBtnBlue }}>
                    通常
                  </Link>
                  <Link href={`/exam?type=${activeQuiz}`} style={{ ...btnStyle, ...styles.bottomBtnGray }}>
                    模擬
                  </Link>
                  <Link href={`/review?type=${activeQuiz}`} style={{ ...btnStyle, ...styles.bottomBtnGreen }}>
                    復習
                  </Link>
                </div>
              </div>
            ) : null}
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={withIndustry("/select-quizzes")} style={{ ...btnStyle, ...styles.btnGreen }}>
                教材を変更する
              </Link>
              <Link href={withIndustry("/plans")} style={{ ...btnStyle, ...styles.btnBlue }}>
                プランを確認
              </Link>
            </div>
          </section>
        )}

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
              <Link href={`/game`} style={{ ...btnStyle, ...styles.btnBlue }}>
                日本語バトルへ
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

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: 18 },
  shell: { maxWidth: 920, margin: "0 auto", padding: 0 },

  h2: { margin: 0, fontSize: 18 },

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

  sectionHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
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
    minHeight: 140,
  },
  quizCardActive: {
    border: "2px solid #93c5fd",
    boxShadow: "0 10px 26px rgba(59,130,246,0.18)",
  },

  bottomBar: {
    position: "sticky",
    bottom: 12,
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 20,
  },
  bottomActions: {
    display: "flex",
    gap: 10,
  },

  bottomBtnBlue: {
    background: "#2563eb",
    color: "#fff",
  },
  bottomBtnGray: {
    background: "#111827",
    color: "#fff",
  },
  bottomBtnGreen: {
    background: "#16a34a",
    color: "#fff",
  },

  quizTitle: { fontWeight: 900, fontSize: 16 },

  quizDesc: { marginTop: 6, fontSize: 13, opacity: 0.85, lineHeight: 1.5, minHeight: 48 },
  quizDescMuted: { marginTop: 6, fontSize: 13, opacity: 0.55, minHeight: 48 },
  quizMeta: { marginTop: 8, fontSize: 12, opacity: 0.6 },

  quizActions: { marginTop: "auto", display: "grid", gap: 8 },

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