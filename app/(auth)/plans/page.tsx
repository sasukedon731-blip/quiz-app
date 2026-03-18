"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { auth } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import { type PlanId } from "@/app/lib/plan"
import {
  loadAndRepairUserPlanState,
  savePlanAndNormalizeSelected,
} from "@/app/lib/userPlanState"
import AppHeader from "@/app/components/AppHeader"

// 画面表示用：通常プラン（ALLは画面に出さず、7教材を追加）
type VisiblePlanId = "3" | "5" | "7"

const CURRENT_PLAN_LABEL: Record<PlanId, string> = {
  trial: "お試し（無料）",
  free: "無料",
  "3": "3教材プラン",
  "5": "5教材プラン",
  all: "ALLプラン（開発用）",
}

const VISIBLE_PLAN_LABEL: Record<VisiblePlanId, string> = {
  "3": "3教材プラン",
  "5": "5教材プラン",
  "7": "7教材プラン",
}

const VISIBLE_PLAN_DESC: Record<VisiblePlanId, string> = {
  "3": "選べる教材の中から3つ選んで受講",
  "5": "選べる教材の中から5つ選んで受講",
  "7": "選べる教材の中から7つ選んで受講",
}

const PRICE_YEN_30D: Record<VisiblePlanId, number> = {
  "3": 500,
  "5": 800,
  "7": 1000,
}

const AI_OPTION_PRICE_30D = 500

function formatYen(n: number) {
  return n.toLocaleString("ja-JP")
}

function monthsFromDays(days: 30 | 180 | 365) {
  return days === 30 ? 1 : days === 180 ? 6 : 12
}

function periodLabel(days: 30 | 180 | 365) {
  return days === 30 ? "30日" : days === 180 ? "半年" : "1年"
}

function calcTotal(base30: number, days: 30 | 180 | 365) {
  if (days === 30) return base30
  if (days === 180) return Math.round(base30 * 6 * 0.9)
  return Math.round(base30 * 12 * 0.8)
}

function calcPerMonth(total: number, days: 30 | 180 | 365) {
  const m = monthsFromDays(days)
  return Math.round(total / m)
}

type IndustryId = "construction" | "manufacturing" | "care" | "driver" | "undecided"

const INDUSTRY_LABEL: Record<IndustryId, string> = {
  construction: "建設",
  manufacturing: "製造",
  care: "介護",
  driver: "運転・免許",
  undecided: "未定（海外から）",
}

function isIndustryId(v: string | null): v is IndustryId {
  return (
    v === "construction" ||
    v === "manufacturing" ||
    v === "care" ||
    v === "driver" ||
    v === "undecided"
  )
}

export default function PlansPage() {
  const router = useRouter()
  const params = useSearchParams()

  const industryParamRaw = params.get("industry")
  const industry: IndustryId | null = isIndustryId(industryParamRaw)
    ? industryParamRaw
    : null

  const withIndustry = (path: string) => {
    if (!industry) return path
    const join = path.includes("?") ? "&" : "?"
    return `${path}${join}industry=${encodeURIComponent(industry)}`
  }

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [currentPlan, setCurrentPlan] = useState<PlanId>("trial")
  const [billingMethod, setBillingMethod] = useState<"convenience" | "card">(
    "convenience"
  )
  const [durationDays, setDurationDays] = useState<30 | 180 | 365>(30)
  const [displayName, setDisplayName] = useState<string>("")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login")
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
      try {
        const st = await loadAndRepairUserPlanState(uid)
        setCurrentPlan(st.plan)
        setDisplayName(st.displayName)
      } catch (e) {
        console.error(e)
        setError("読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [uid])

  const allCount = useMemo(() => Object.keys(quizzes).length, [])

  const startCheckout = async (plan: VisiblePlanId) => {
    if (!uid) return
    setSaving(true)
    setError("")

    try {
      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) throw new Error("ログイン情報を取得できませんでした")

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          plan,
          method: billingMethod,
          durationDays,
          industry,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "決済開始に失敗しました")
      if (!data?.url) throw new Error("決済URLが取得できませんでした")

      window.location.href = data.url
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? "決済開始に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  const handleChoose = async (plan: PlanId | VisiblePlanId) => {
    if (!uid) return
    setSaving(true)
    setError("")

    try {
      if (plan === "3" || plan === "5" || plan === "7") {
        await startCheckout(plan)
        return
      }

      await savePlanAndNormalizeSelected({ uid, plan })
      router.push(withIndustry("/select-mode"))
    } catch (e) {
      console.error(e)
      setError("プラン更新に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 24 }}>読み込み中...</div>

  const months = monthsFromDays(durationDays)
  const aiOptionTotal = calcTotal(AI_OPTION_PRICE_30D, durationDays)
  const aiOptionPerMonth = calcPerMonth(aiOptionTotal, durationDays)

  return (
    <main style={styles.main}>
      <AppHeader title="プラン" />

      {industry ? (
        <section style={{ ...styles.card, borderColor: "rgba(37,99,235,.35)", background: "#eff6ff" }}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>
            選択中の業種：<b>{INDUSTRY_LABEL[industry]}</b>
          </div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85, lineHeight: 1.6 }}>
            このまま進むと、教材選択画面も「{INDUSTRY_LABEL[industry]}向け」で絞り込み表示されます。
          </div>
        </section>
      ) : null}

      <section style={styles.card}>
        <div style={styles.cardTitle}>現在のプラン</div>
        <div style={styles.cardText}>
          {displayName ? `${displayName} さん：` : ""} <b>{CURRENT_PLAN_LABEL[currentPlan]}</b>
        </div>
      </section>

      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.card}>
        <div style={styles.secTitle}>教材数</div>
        <div style={styles.secCount}>現在 {allCount}教材</div>
      </section>

      <section style={styles.card}>
        <div style={styles.secTitle}>お支払い方法（個人）</div>
        <div style={styles.secTextStrong}>
          外国人ユーザー向けに <b>コンビニ払い</b> をおすすめにします（カードは任意）。
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <label
            style={{
              ...styles.pmCard,
              ...(billingMethod === "convenience" ? styles.pmCardOn : null),
            }}
          >
            <input
              type="radio"
              name="pay"
              checked={billingMethod === "convenience"}
              onChange={() => setBillingMethod("convenience")}
              style={styles.pmRadio}
            />
            <div style={styles.pmBody}>
              <div style={styles.pmTop}>
                <div style={styles.pmLabel}>コンビニ払い</div>
                <span style={styles.pmBadge}>おすすめ</span>
              </div>
              <div style={styles.pmDesc}>現金で支払い可能。カードがなくてもOK。</div>
            </div>
          </label>

          <label
            style={{
              ...styles.pmCard,
              ...(billingMethod === "card" ? styles.pmCardOn : null),
            }}
          >
            <input
              type="radio"
              name="pay"
              checked={billingMethod === "card"}
              onChange={() => setBillingMethod("card")}
              style={styles.pmRadio}
            />
            <div style={styles.pmBody}>
              <div style={styles.pmTop}>
                <div style={styles.pmLabel}>カード払い</div>
              </div>
              <div style={styles.pmDesc}>即時決済。更新もスムーズ。</div>
            </div>
          </label>
        </div>

        <div style={styles.durationWrap}>
          <div style={{ fontWeight: 900, fontSize: 13 }}>期間</div>
          <div style={styles.durationRow}>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value) as 30 | 180 | 365)}
              style={styles.select}
            >
              <option value={30}>30日（通常）</option>
              <option value={180}>半年（10%OFF）</option>
              <option value={365}>年（20%OFF）</option>
            </select>

            <span style={styles.hint}>
              選んだ期間に応じて、下のプラン価格も自動で切り替わります（{months}ヶ月換算）
            </span>
          </div>
        </div>
      </section>

      <section style={styles.sectionBlock}>
        <div style={styles.sectionTitle}>基本プラン</div>
        <div style={styles.sectionSub}>通常の選べる教材プランです。AI会話はこの中には含まれません。</div>

        <div style={styles.planGrid}>
          {(["3", "5", "7"] as VisiblePlanId[]).map((p) => {
            const base30 = PRICE_YEN_30D[p]
            const total = calcTotal(base30, durationDays)
            const perMonth = calcPerMonth(total, durationDays)
            const compareTotal = base30 * months
            const saved = Math.max(0, compareTotal - total)
            const isCurrent = currentPlan === p

            return (
              <div key={p} style={styles.planCard}>
                <div style={styles.planTitle}>{VISIBLE_PLAN_LABEL[p]}</div>
                <div style={styles.planDesc}>{VISIBLE_PLAN_DESC[p]}</div>

                <div style={{ marginTop: 12 }}>
                  <div style={styles.priceRow}>
                    <div style={styles.priceMain}>
                      ¥{formatYen(total)}
                      <span style={styles.priceUnit}> / {periodLabel(durationDays)}</span>
                    </div>
                  </div>

                  <div style={styles.priceSub}>
                    実質 ¥{formatYen(perMonth)} / 月（{months}ヶ月換算）
                  </div>

                  {durationDays !== 30 && (
                    <div style={styles.priceSave}>
                      30日×{months}回より <b>¥{formatYen(saved)}</b> お得
                    </div>
                  )}
                </div>

                <div style={styles.planMeta}>利用可能：{p}教材（選択式）</div>

                <button
                  onClick={() => handleChoose(p)}
                  disabled={saving || isCurrent}
                  style={{
                    ...styles.planBtn,
                    background: isCurrent ? "#9ca3af" : "#2563eb",
                    cursor: saving || isCurrent ? "not-allowed" : "pointer",
                    opacity: saving ? 0.85 : 1,
                  }}
                >
                  {isCurrent ? "現在のプラン" : saving ? "更新中..." : "このプランにする"}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section style={styles.aiWrap}>
        <div style={styles.aiHeaderRow}>
          <div>
            <div style={styles.aiEyebrow}>追加オプション</div>
            <div style={styles.aiTitle}>AI会話</div>
          </div>
          <div style={styles.aiPriceBadge}>+¥{formatYen(aiOptionTotal)}</div>
        </div>

        <div style={styles.aiLead}>
          AI会話は、通常の選べる教材には含まれません。<br />
          <b>3教材・5教材・7教材プランに追加して使う機能</b>です。
        </div>

        <div style={styles.aiPointGrid}>
          <div style={styles.aiPointCard}>
            <div style={styles.aiPointTitle}>別料金で追加</div>
            <div style={styles.aiPointText}>どの基本プランでも月額 +¥500 で追加できます。</div>
          </div>
          <div style={styles.aiPointCard}>
            <div style={styles.aiPointTitle}>教材数に含まれない</div>
            <div style={styles.aiPointText}>3/5/7教材の選択枠はそのまま使えます。</div>
          </div>
          <div style={styles.aiPointCard}>
            <div style={styles.aiPointTitle}>実践向け</div>
            <div style={styles.aiPointText}>問題演習とは別に、会話のアウトプットを強化します。</div>
          </div>
        </div>

        <div style={styles.aiPricePanel}>
          <div>
            <div style={styles.aiPanelTitle}>AI会話オプション</div>
            <div style={styles.aiPanelSub}>実質 ¥{formatYen(aiOptionPerMonth)} / 月（{months}ヶ月換算）</div>
          </div>
          <div style={styles.aiPanelRight}>基本プランに追加</div>
        </div>

        <div style={styles.aiNote}>
          ※ 画面上ではオプションとして案内しています。実際に決済で追加するには、
          Stripe/API 側でも「AI会話オプション」の商品追加が必要です。
        </div>
      </section>

      <section style={{ ...styles.card, marginTop: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 14 }}>お試し（開発/検証用）</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8, lineHeight: 1.6 }}>
          ※ trial/free を使う場合も、保存後は業種を保持して select-mode に戻ります。
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <button
            onClick={() => handleChoose("trial")}
            disabled={saving || currentPlan === "trial"}
            style={{
              ...styles.planBtn,
              width: "auto",
              padding: "10px 14px",
              background: currentPlan === "trial" ? "#9ca3af" : "#111827",
              cursor: saving || currentPlan === "trial" ? "not-allowed" : "pointer",
            }}
          >
            trial にする
          </button>
          <button
            onClick={() => handleChoose("free")}
            disabled={saving || currentPlan === "free"}
            style={{
              ...styles.planBtn,
              width: "auto",
              padding: "10px 14px",
              background: currentPlan === "free" ? "#9ca3af" : "#111827",
              cursor: saving || currentPlan === "free" ? "not-allowed" : "pointer",
            }}
          >
            free にする
          </button>

          <button
            onClick={() => router.push(withIndustry("/select-mode"))}
            disabled={saving}
            style={{
              ...styles.planBtn,
              width: "auto",
              padding: "10px 14px",
              background: "#16a34a",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            select-modeへ戻る
          </button>
        </div>
      </section>

      <section style={{ ...styles.card, marginTop: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 14 }}>補足</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8, lineHeight: 1.7 }}>
          ・基本プラン購入後、受講する教材を選択します。<br />
          ・AI会話は教材数には含まれず、追加オプションとして利用します。<br />
          ・期間を「半年 / 年」にすると割引され、更新回数も減ります。<br />
          ・業種を選んでいる場合、教材選択画面はその業種向けに絞り込み表示されます。
        </div>
      </section>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "16px 14px",
  },

  card: {
    marginTop: 12,
    padding: 14,
    border: "1px solid rgba(17,24,39,.10)",
    borderRadius: 16,
    background: "#fff",
  },

  cardTitle: {
    fontWeight: 900,
    marginBottom: 6,
    fontSize: 14,
  },

  cardText: {
    opacity: 0.88,
    lineHeight: 1.5,
  },

  error: {
    color: "#dc2626",
    marginTop: 10,
    fontWeight: 800,
  },

  secTitle: {
    fontWeight: 900,
    fontSize: 16,
  },

  secCount: {
    marginTop: 8,
    fontWeight: 900,
    fontSize: 18,
    lineHeight: 1.4,
  },

  secTextStrong: {
    marginTop: 6,
    opacity: 0.85,
    lineHeight: 1.6,
    fontSize: 13,
  },

  pmCard: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    background: "#fff",
    border: "1px solid rgba(17,24,39,.12)",
    cursor: "pointer",
    userSelect: "none",
  },

  pmCardOn: {
    border: "1px solid rgba(37,99,235,.55)",
    boxShadow: "0 6px 18px rgba(17,24,39,.08)",
  },

  pmRadio: {
    marginTop: 3,
    width: 18,
    height: 18,
    flex: "0 0 auto",
  },

  pmBody: {
    minWidth: 0,
    flex: 1,
  },

  pmTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  pmLabel: {
    fontWeight: 900,
    fontSize: 15,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  pmBadge: {
    fontSize: 11,
    fontWeight: 900,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(37,99,235,.10)",
    color: "rgba(37,99,235,1)",
    flex: "0 0 auto",
    whiteSpace: "nowrap",
  },

  pmDesc: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 1.45,
    opacity: 0.75,
  },

  durationWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: "1px solid rgba(17,24,39,.08)",
  },

  durationRow: {
    marginTop: 8,
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  select: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,.12)",
    background: "white",
    fontWeight: 800,
    minWidth: 180,
  },

  hint: {
    fontSize: 13,
    opacity: 0.75,
    lineHeight: 1.4,
  },

  sectionBlock: {
    marginTop: 16,
  },

  sectionTitle: {
    fontWeight: 900,
    fontSize: 20,
    lineHeight: 1.2,
  },

  sectionSub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 1.6,
    opacity: 0.78,
  },

  planGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 12,
  },

  planCard: {
    border: "1px solid rgba(17,24,39,.10)",
    borderRadius: 16,
    padding: 14,
    background: "#fff",
  },

  planTitle: {
    fontWeight: 900,
    fontSize: 16,
  },

  planDesc: {
    marginTop: 6,
    opacity: 0.8,
    lineHeight: 1.5,
    fontSize: 13,
  },

  priceRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
  },

  priceMain: {
    fontWeight: 900,
    fontSize: 24,
    lineHeight: 1.1,
  },

  priceUnit: {
    fontSize: 12,
    opacity: 0.75,
    marginLeft: 6,
    fontWeight: 800,
  },

  priceSub: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.8,
  },

  priceSave: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.75,
  },

  planMeta: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.85,
  },

  planBtn: {
    width: "100%",
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "none",
    color: "#fff",
    fontWeight: 900,
  },

  aiWrap: {
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    background: "linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)",
    border: "1px solid rgba(59,130,246,.18)",
  },

  aiHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  aiEyebrow: {
    display: "inline-flex",
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(37,99,235,.10)",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 900,
  },

  aiTitle: {
    marginTop: 8,
    fontWeight: 900,
    fontSize: 24,
    lineHeight: 1.15,
    color: "#0f172a",
  },

  aiPriceBadge: {
    padding: "10px 12px",
    borderRadius: 14,
    background: "#2563eb",
    color: "#fff",
    fontWeight: 900,
    fontSize: 18,
    lineHeight: 1.1,
  },

  aiLead: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 1.75,
    color: "#1f2937",
  },

  aiPointGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },

  aiPointCard: {
    padding: 12,
    borderRadius: 14,
    background: "#fff",
    border: "1px solid rgba(17,24,39,.08)",
  },

  aiPointTitle: {
    fontWeight: 900,
    fontSize: 14,
    color: "#0f172a",
  },

  aiPointText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#374151",
  },

  aiPricePanel: {
    marginTop: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    padding: 14,
    borderRadius: 16,
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#fff",
  },

  aiPanelTitle: {
    fontWeight: 900,
    fontSize: 18,
  },

  aiPanelSub: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.92,
  },

  aiPanelRight: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,.16)",
    fontSize: 13,
    fontWeight: 900,
  },

  aiNote: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 1.7,
    color: "#475569",
  },
}
