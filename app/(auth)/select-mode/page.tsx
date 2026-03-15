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
import { quizCatalog } from "@/app/data/quizCatalog"

const PLAN_LABEL: Record<PlanId, string> = {
  trial: "お試し（無料）",
  free: "無料",
  "3": "3教材プラン",
  "5": "5教材プラン",
  all: "ALLプラン",
}

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

type GroupConfig = {
  title: string
  description: string
  quizIds?: QuizType[]
  isBattle?: boolean
}

const GROUP_CONFIG: Record<string, GroupConfig> = {
  // 共通
  jlpt: {
    title: "日本語検定を学ぶ",
    description: "N4・N3・N2・スピーキング",
    quizIds: ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice"],
  },
  battle: {
    title: "日本語バトル",
    description: "語彙・文法・判断・記憶ゲーム",
    isBattle: true,
  },

  // 建設
  "construction-vocabulary": {
    title: "建設用語を学ぶ",
    description: "道具・建築・土木・電気・空調衛生・プラント・施工管理",
    quizIds: [
      "construction-tools",
      "architecture-terms",
      "civil-terms",
      "electric-terms",
      "hvac-terms",
      "plant-terms",
      "construction-management-terms",
    ],
  },
  "construction-exam": {
    title: "施工管理試験を学ぶ",
    description: "2級建築・土木・電気・管工事施工管理",
    quizIds: [
      "kenchiku-sekou-2kyu-1ji",
      "doboku-sekou-2kyu-1ji",
      "denki-sekou-2kyu-1ji",
      "kanko-sekou-2kyu-1ji",
    ],
  },
  "construction-japanese": {
    title: "現場日本語を学ぶ",
    description: "現場用語・聞き取り・会話",
    quizIds: ["genba-listening", "genba-phrasebook"],
  },

  // 製造
"manufacturing-vocabulary": {
  title: "製造用語を学ぶ",
  description: "製造用語の基礎",
  quizIds: [
    "manufacturing-meaning",
    "manufacturing-word",
  ],
},
  "manufacturing-listening": {
    title: "製造リスニングを学ぶ",
    description: "現場の聞き取りを強化",
    quizIds: ["manufacturing-listening"],
  },
  "manufacturing-conversation": {
    title: "製造現場会話を学ぶ",
    description: "現場会話・やりとりを学ぶ",
    quizIds: ["manufacturing-conversation"],
  },
  "manufacturing-skill": {
    title: "技能試験を学ぶ",
    description: "技能検定 機械加工 学科",
    quizIds: ["skill-test-machining"],
  },

  // 介護
  "care-vocabulary": {
    title: "介護用語を学ぶ",
    description: "介護現場で使う重要用語",
    quizIds: ["care-terms"],
  },
  "care-listening": {
    title: "介護リスニングを学ぶ",
    description: "介護現場の聞き取り",
    quizIds: ["care-listening"],
  },
  "care-conversation": {
    title: "介護現場会話を学ぶ",
    description: "現場会話・対応を学ぶ",
    quizIds: ["care-conversation"],
  },
  "care-exam": {
    title: "介護福祉士試験",
    description: "国家試験レベルの問題",
    quizIds: ["care-worker-exam"],
  },

  // 運転
  "driver-license": {
    title: "外国免許切替を学ぶ",
    description: "交通ルール・優先関係・標識",
    quizIds: ["gaikoku-license"],
  },
  "driver-signs": {
    title: "道路標識を学ぶ",
    description: "標識を集中して覚える",
    quizIds: ["road-signs"],
  },

  // 未定
  "undecided-speaking": {
    title: "スピーキングを学ぶ",
    description: "話す練習・発話練習",
    quizIds: ["speaking-practice"],
  },
  "dialect-learning": {
    title: "全国の方言を学ぶ",
    description: "関西弁リスニングと全国方言の意味当て",
    quizIds: ["kansai-listening", "dialect-meaning"],
  },
}

function getGroupTitle(group: string | null, industry: IndustryId | null) {
  if (group && GROUP_CONFIG[group]) return GROUP_CONFIG[group].title
  if (industry) return INDUSTRY_LABEL[industry]
  return "学習を始める"
}

function getGroupDescription(group: string | null) {
  if (group && GROUP_CONFIG[group]) return GROUP_CONFIG[group].description
  return "教材を選んで「通常 / 模擬 / 復習 / 日本語バトル」を開始できます。"
}

export default function SelectModePage() {
  const router = useRouter()
  const params = useSearchParams()

  let industry = (params.get("industry") as IndustryId | null) ?? null
  const group = params.get("group")
  const [industryReady, setIndustryReady] = useState(false)

  const LS_INDUSTRY_KEY = "selected-industry"

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
        const next = `/select-mode?industry=${encodeURIComponent(saved)}${
          group ? `&group=${encodeURIComponent(group)}` : ""
        }`
        router.replace(next)
        return
      }
    } catch {}

    setIndustryReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const withIndustry = (path: string) => {
    const qs: string[] = []
    if (industry) qs.push(`industry=${encodeURIComponent(industry)}`)
    if (group) qs.push(`group=${encodeURIComponent(group)}`)
    if (qs.length === 0) return path
    const join = path.includes("?") ? "&" : "?"
    return `${path}${join}${qs.join("&")}`
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

  const filteredSelectedCards = useMemo(() => {
    const activeCatalogIds = new Set(
      quizCatalog.filter((q) => q.enabled !== false).map((q) => q.id)
    )

    let ids = selected.filter((q) => {
      if (!quizzes[q]) return false
      if (!activeCatalogIds.has(q)) return false
      return true
    })

    if (group && GROUP_CONFIG[group]?.quizIds) {
      const allowed = GROUP_CONFIG[group].quizIds!
      ids = ids.filter((q) => allowed.includes(q))
    }

    return ids
  }, [selected, group])

  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null)

  useEffect(() => {
    if (!activeQuiz || (activeQuiz && !filteredSelectedCards.includes(activeQuiz))) {
      setActiveQuiz(filteredSelectedCards[0] ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSelectedCards.join(",")])

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
              <div style={{ fontWeight: 900 }}>利用開始にはお支払い手続きが必要です</div>
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

  const currentGroup = group ? GROUP_CONFIG[group] : null
  const isBattleGroup = !!currentGroup?.isBattle
  const pageTitle = getGroupTitle(group, industry)
  const pageDescription = getGroupDescription(group)

  return (
    <main style={styles.page}>
      <div style={shellStyle}>
        {accessBlocked ? (
          <div style={styles.payWarn}>
            <div style={{ fontWeight: 900 }}>利用開始にはお支払い手続きが必要です</div>
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

        <AppHeader title={pageTitle} />

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
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>{pageDescription}</div>
        </div>

        {error ? <div style={styles.alert}>{error}</div> : null}

        {isBattleGroup ? (
          <section style={{ marginTop: 16 }}>
            <div style={styles.sectionHead}>
              <h2 style={styles.h2}>日本語バトル</h2>
              <span style={styles.badge}>目玉</span>
            </div>

            <div style={styles.quizCard}>
              <div style={styles.quizTitle}>🎮 日本語バトルをプレイ</div>
              <div style={styles.quizDesc}>
                語彙・文法・判断・記憶ゲーム。
                <br />
                非会員は1日1回、会員は無制限でプレイできます。
              </div>
              <div style={styles.quizActions}>
                <Link href="/game" style={{ ...btnStyle, ...styles.btnBlue }}>
                  日本語バトルへ
                </Link>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={withIndustry("/select-quizzes")} style={{ ...btnStyle, ...styles.btnGreen }}>
                教材を変更する
              </Link>
              <Link href={withIndustry("/plans")} style={{ ...btnStyle, ...styles.btnBlue }}>
                プランを確認
              </Link>
            </div>
          </section>
        ) : filteredSelectedCards.length === 0 ? (
          <section style={styles.card}>
            <div style={styles.cardTitle}>この分類の教材が選択されていません</div>
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
              <h2 style={styles.h2}>{pageTitle}</h2>
              <span style={styles.badge}>{filteredSelectedCards.length} 件</span>
            </div>

            <div style={gridStyle}>
              {filteredSelectedCards.map((id) => {
                const q = quizzes[id]
                const isSelected = activeQuiz === id

                return (
                  <div
                    key={id}
                    style={{
                      ...styles.quizCard,
                      ...(isSelected ? styles.quizCardActive : {}),
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveQuiz(id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setActiveQuiz(id)
                    }}
                  >
                    <div style={styles.quizHeadRow}>
                      <div style={styles.quizTitle}>{q.title}</div>
                      {isSelected ? <span style={styles.selectBadge}>選択中</span> : null}
                    </div>

                    {q.description ? (
                      <div style={styles.quizDesc}>{q.description}</div>
                    ) : (
                      <div style={styles.quizDescMuted}>（説明なし）</div>
                    )}

                    {!isSelected ? (
                      <div style={styles.tapHint}>タップして選択</div>
                    ) : (
                      <div style={styles.cardActionWrap}>
                        <div style={styles.cardActionTitle}>この教材を始める</div>
                        <div style={styles.cardActions}>
                          <Link
                            href={`/normal?type=${id}`}
                            style={{ ...btnStyle, ...styles.cardBtnBlue }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            通常
                          </Link>
                          <Link
                            href={`/exam?type=${id}`}
                            style={{ ...btnStyle, ...styles.cardBtnGray }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            模擬
                          </Link>
                          <Link
                            href={`/review?type=${id}`}
                            style={{ ...btnStyle, ...styles.cardBtnGreen }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            復習
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

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

        {!isBattleGroup ? (
          <section style={{ marginTop: 16 }}>
            <div style={styles.sectionHead}>
              <h2 style={styles.h2}>ゲームで学ぶ</h2>
              <span style={styles.badge}>NEW</span>
            </div>

            <div style={styles.quizCard}>
              <div style={styles.quizTitle}>🎮 日本語バトル</div>
              <div style={styles.quizDesc}>
                どの業種でも使える共通ゲームです。
                <br />
                非会員は1日1回、会員は無制限でプレイできます。
              </div>
              <div style={styles.quizActions}>
                <Link href="/game" style={{ ...btnStyle, ...styles.btnBlue }}>
                  日本語バトルへ
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <footer style={styles.footer}>
          <div style={styles.footerNote}>
            ※ 業種と分類に合わせて、今月選択中の教材だけを表示しています。
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
    padding: 12,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 140,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  quizCardActive: {
    border: "2px solid #93c5fd",
    boxShadow: "0 10px 26px rgba(59,130,246,0.18)",
    transform: "translateY(-1px)",
  },

  quizHeadRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  selectBadge: {
    fontSize: 12,
    fontWeight: 900,
    padding: "5px 10px",
    borderRadius: 999,
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    whiteSpace: "nowrap",
  },

  quizTitle: { fontWeight: 900, fontSize: 16 },

  quizDesc: { marginTop: 6, fontSize: 13, opacity: 0.85, lineHeight: 1.5, minHeight: 32 },
  quizDescMuted: { marginTop: 6, fontSize: 13, opacity: 0.55, minHeight: 48 },
  quizMeta: { marginTop: 8, fontSize: 12, opacity: 0.6 },

  tapHint: {
    marginTop: "auto",
    paddingTop: 12,
    fontSize: 12,
    fontWeight: 800,
    color: "#94a3b8",
  },

  cardActionWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: "1px solid #e5e7eb",
  },

  cardActionTitle: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: 900,
    color: "#475569",
  },

  cardActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  cardBtnBlue: {
    background: "#2563eb",
    color: "#fff",
  },
  cardBtnGray: {
    background: "#111827",
    color: "#fff",
  },
  cardBtnGreen: {
    background: "#16a34a",
    color: "#fff",
  },

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