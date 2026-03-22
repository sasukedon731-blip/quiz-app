"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { auth, db } from "@/app/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { quizzes } from "@/app/data/quizzes"
import { type PlanId } from "@/app/lib/plan"
import {
  loadAndRepairUserPlanState,
  savePlanAndNormalizeSelected,
} from "@/app/lib/userPlanState"
import AppHeader from "@/app/components/AppHeader"
import LegalFooter from "@/app/components/LegalFooter"
import CheckoutResultNotice from "@/app/components/billing/CheckoutResultNotice"
import KonbiniGuideNotice from "@/app/components/billing/KonbiniGuideNotice"

const PLAN_LABEL: Record<PlanId, string> = {
  trial: "お試し（無料）",
  free: "無料",
  "3": "3教材プラン",
  "5": "5教材プラン",
  "7": "7教材プラン",
}

const PLAN_DESC: Record<PlanId, string> = {
  trial: "まずは1教材で体験。気に入ったらプラン変更できます。",
  free: "無料のまま使う（お試しと同等）",
  "3": "10以上の教材から3つ選んで受講",
  "5": "10以上の教材から5つ選んで受講",
  "7": "10以上の教材から7つ選んで受講",
}

/**
 * ✅ 価格（30日）
 * - ここだけ変えれば全表示が変わる
 */
const PRICE_YEN_30D: Record<PlanId, number> = {
  trial: 0,
  free: 0,
  "3": 500,
  "5": 800,
  "7": 1000,
}

function formatYen(n: number) {
  return n.toLocaleString("ja-JP")
}

function monthsFromDays(days: 30 | 180 | 365) {
  return days === 30 ? 1 : days === 180 ? 6 : 12
}

function periodLabel(days: 30 | 180 | 365) {
  return days === 30 ? "30日" : days === 180 ? "半年" : "1年"
}

/**
 * ✅ 期間合計金額（割引ルール）
 * - 半年：10%OFF
 * - 年：20%OFF
 */
function calcTotal(base30: number, days: 30 | 180 | 365) {
  if (days === 30) return base30
  if (days === 180) return Math.round(base30 * 6 * 0.9)
  return Math.round(base30 * 12 * 0.8)
}

function calcPerMonth(total: number, days: 30 | 180 | 365) {
  const m = monthsFromDays(days)
  return Math.round(total / m)
}

type IndustryId =
  | "construction"
  | "manufacturing"
  | "care"
  | "driver"
  | "undecided"

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
  const checkout = params.get("checkout")

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
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [currentPlan, setCurrentPlan] = useState<PlanId>("trial")
  const [pendingPlan, setPendingPlan] = useState<"3" | "5" | "7">("3")
  const [addAiConversation, setAddAiConversation] = useState(false)
  const [aiConversationEnabled, setAiConversationEnabled] = useState(false)
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
      setUser(u) // ←これ追加
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
        setPendingPlan(
          st.plan === "3" || st.plan === "5" || st.plan === "7" ? st.plan : "3"
        )
        setDisplayName(st.displayName)

        const userSnap = await getDoc(doc(db, "users", uid))
        const userData = userSnap.exists() ? userSnap.data() : null
        setAiConversationEnabled(
          Boolean(userData?.billing?.aiConversationEnabled)
        )
      } catch (e) {
        console.error(e)
        setError("読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [uid])

  const allCount = useMemo(() => Object.keys(quizzes).length, [])

  const startCheckout = async (plan: PlanId) => {
    if (!user) return
    setSaving(true)
    setError("")

    try {
      const idToken = await user.getIdToken()
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
          addAiConversation,
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

  const handleChoose = async (plan: PlanId) => {
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
  const planTotal = calcTotal(PRICE_YEN_30D[pendingPlan], durationDays)
  const planPerMonth = calcPerMonth(planTotal, durationDays)
  const aiOptionTotal = addAiConversation ? 500 * months : 0
  const grandTotal = planTotal + aiOptionTotal

  return (
    <main style={styles.main}>
      <AppHeader title="プラン" />

      <CheckoutResultNotice
        checkout={checkout}
        showAiCta={aiConversationEnabled || addAiConversation}
      />
      <KonbiniGuideNotice />

      {industry ? (
        <section
          style={{
            ...styles.card,
            borderColor: "rgba(37,99,235,.35)",
            background: "#eff6ff",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 14 }}>
            選択中の業種：<b>{INDUSTRY_LABEL[industry]}</b>
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              opacity: 0.85,
              lineHeight: 1.6,
            }}
          >
            このまま進むと、教材選択画面も「{INDUSTRY_LABEL[industry]}向け」で絞り込み表示されます。
          </div>
        </section>
      ) : null}

      <section
        style={{
          ...styles.card,
          borderColor: "rgba(37,99,235,.28)",
          background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
        }}
      >
        <div style={styles.heroTitle}>このアプリでできること</div>
        <div style={styles.heroLead}>
          仕事で使う日本語、資格対策、AIを使った実践練習を、1つのアプリでまとめて学べます。
        </div>

        <div style={styles.heroPointList}>
          <div style={styles.heroPointItem}>
            ・業種に合わせた教材を選んで期間集中学習
          </div>
          <div style={styles.heroPointItem}>
            ・日本語バトルで毎日楽しく復習
          </div>
          <div style={styles.heroPointItem}>
            ・AI会話を追加すれば実践的な会話練習も可能
          </div>
        </div>

        <div style={styles.heroInfoGrid}>
          <div style={styles.heroInfoCard}>
            <div style={styles.heroInfoLabel}>無料でできること</div>
            <div style={styles.heroInfoTitle}>日本語バトル 1日1回</div>
            <div style={styles.heroInfoText}>
              まずは無料で日本語バトルから始められます。操作感や学習の雰囲気を気軽に確認できます。
            </div>
          </div>

          <div style={styles.heroInfoCard}>
            <div style={styles.heroInfoLabel}>有料プランでできること</div>
            <div style={styles.heroInfoTitle}>3 / 5 / 7教材を期間利用</div>
            <div style={styles.heroInfoText}>
              選んだ教材を購入した期間中しっかり学習できます。期間終了後は、必要に応じて再購入してください。
            </div>
          </div>
        </div>

        <div style={styles.heroFootNote}>
          ※ AI会話は通常教材とは別料金です。必要な方だけ追加できます。料金は選択した利用期間に応じて計算されます。
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>現在のプラン</div>
        <div style={styles.cardText}>
          {displayName ? `${displayName} さん：` : ""}{" "}
          <b>{PLAN_LABEL[currentPlan]}</b>
        </div>
      </section>

      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.card}>
        <div style={styles.secTitle}>教材数</div>
        <div style={styles.secText}>
          現在 <b>{allCount}</b> 教材
        </div>
        <div style={styles.secText}>
          3/5/7プランでは、ここから選んで受講できます。
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.secTitle}>お支払い方法（個人）</div>
        <div style={styles.secTextStrong}>
          外国人ユーザー向けに <b>コンビニ払い</b>{" "}
          をおすすめにします（カードは任意）。
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
              <div style={styles.pmDesc}>
                現金で支払い可能。カードがなくてもOK。
              </div>
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
              <div style={styles.pmDesc}>
                即時決済。すぐに利用を開始できます。
              </div>
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
              選んだ期間に応じて、下のプラン価格も自動で切り替わります（{months}
              ヶ月換算）
            </span>
          </div>
        </div>
      </section>

      <div style={styles.planGrid}>
        {(["3", "5", "7"] as const).map((p) => {
          const isCurrent = p === currentPlan
          const isPending = p === pendingPlan

          const base30 = PRICE_YEN_30D[p]
          const total = calcTotal(base30, durationDays)
          const perMonth = calcPerMonth(total, durationDays)
          const compareTotal = base30 * months
          const saved = Math.max(0, compareTotal - total)

          return (
            <div
              key={p}
              style={{
                ...styles.planCard,
                ...(isPending ? styles.planCardSelected : null),
              }}
            >
              <div style={styles.planHeadRow}>
                <div style={styles.planTitle}>{PLAN_LABEL[p]}</div>
                {isCurrent ? (
                  <span style={styles.currentBadge}>利用中</span>
                ) : null}
              </div>
              <div style={styles.planDesc}>{PLAN_DESC[p]}</div>

              <div style={{ marginTop: 12 }}>
                <div style={styles.priceRow}>
                  <div style={styles.priceMain}>
                    ¥{formatYen(total)}
                    <span style={styles.priceUnit}>
                      {" "}
                      / {periodLabel(durationDays)}
                    </span>
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

              <div style={styles.planMeta}>
                {p === "3" && "利用可能：3教材（選択式）"}
                {p === "5" && "利用可能：5教材（選択式）"}
                {p === "7" && "利用可能：7教材（選択式）"}
              </div>

              <button
                type="button"
                onClick={() => setPendingPlan(p)}
                disabled={saving}
                style={{
                  ...styles.planBtn,
                  background: isPending ? "#2563eb" : "#111827",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.85 : 1,
                }}
              >
                {isPending
                  ? "選択中"
                  : isCurrent
                    ? "このプランに変更する"
                    : "このプランを選ぶ"}
              </button>
            </div>
          )
        })}
      </div>

      <section
        style={{
          ...styles.card,
          marginTop: 16,
          borderColor: "rgba(16,185,129,.35)",
          background: "#ecfdf5",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>AI会話オプション</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            lineHeight: 1.7,
            opacity: 0.88,
          }}
        >
          AI会話は通常の選べる教材には含まれません。
          <br />
          3教材・5教材・7教材プランに追加できます。
          <br />
          教材数には含まれない、別枠の実践トレーニングです。
        </div>

        <label
          style={{
            ...styles.pmCard,
            ...(addAiConversation ? styles.pmCardOn : null),
            marginTop: 12,
          }}
        >
          <input
            type="checkbox"
            checked={addAiConversation}
            onChange={(e) => setAddAiConversation(e.target.checked)}
            style={styles.pmRadio}
          />
          <div style={styles.pmBody}>
            <div style={styles.pmTop}>
              <div style={styles.pmLabel}>AI会話を追加する</div>
              <span style={styles.pmBadge}>月額 ¥500相当</span>
            </div>
            <div style={styles.pmDesc}>
              通常教材とは別枠。実際に話して練習できます。
            </div>
          </div>
        </label>

        {aiConversationEnabled ? (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              fontWeight: 800,
              color: "#047857",
            }}
          >
            現在AI会話オプションは有効です
          </div>
        ) : null}

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.78, lineHeight: 1.6 }}>
          ※ AI会話オプションは割引なしです。
          {addAiConversation
            ? ` 選択中の${periodLabel(durationDays)}では ¥500 × ${months}ヶ月 = ¥${formatYen(
                aiOptionTotal
              )} になります。`
            : ""}
        </div>
      </section>

      <section
        style={{
          ...styles.card,
          marginTop: 16,
          borderColor: "rgba(37,99,235,.24)",
          background: "#f8fafc",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>お支払い合計</div>

        <div style={styles.totalBox}>
          <div style={styles.totalRow}>
            <span>
              {PLAN_LABEL[pendingPlan]}（{periodLabel(durationDays)}）
            </span>
            <b>¥{formatYen(planTotal)}</b>
          </div>
          <div style={styles.totalRow}>
            <span>AI会話オプション</span>
            <b>
              {addAiConversation
                ? `¥500 × ${months}ヶ月 = ¥${formatYen(aiOptionTotal)}`
                : "¥0"}
            </b>
          </div>
        </div>

        <div style={styles.totalDivider} />

        <div style={styles.totalBottom}>
          <div>
            <div style={styles.totalLabel}>今回のお支払い</div>
            <div style={styles.totalHint}>
              選択中の支払い方法：
              {billingMethod === "convenience" ? "コンビニ払い" : "カード払い"} /
              基本プラン実質 ¥{formatYen(planPerMonth)} / 月
            </div>
          </div>
          <div style={styles.totalPrice}>¥{formatYen(grandTotal)}</div>
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            lineHeight: 1.7,
            color: "rgba(17,24,39,.72)",
          }}
        >
          このプランは買い切り型です。自動更新はありません。利用期間終了後は、必要に応じて再購入してください。
        </div>

        <button
          onClick={() => handleChoose(pendingPlan)}
          disabled={saving}
          style={{
            ...styles.checkoutBtn,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.85 : 1,
          }}
        >
          {saving ? "決済ページへ移動中..." : "この内容で決済に進む"}
        </button>
      </section>

      <LegalFooter compact />
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

  heroTitle: {
    fontWeight: 900,
    fontSize: 20,
    lineHeight: 1.25,
  },

  heroLead: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 1.75,
    opacity: 0.88,
  },

  heroPointList: {
    marginTop: 14,
    display: "grid",
    gap: 8,
  },

  heroPointItem: {
    fontSize: 13,
    lineHeight: 1.65,
    fontWeight: 700,
    color: "#1f2937",
  },

  heroInfoGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },

  heroInfoCard: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(17,24,39,.08)",
    background: "#fff",
  },

  heroInfoLabel: {
    fontSize: 12,
    fontWeight: 900,
    color: "#2563eb",
  },

  heroInfoTitle: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: 900,
    lineHeight: 1.35,
  },

  heroInfoText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 1.7,
    opacity: 0.82,
  },

  heroFootNote: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 1.6,
    opacity: 0.75,
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

  secText: {
    marginTop: 6,
    opacity: 0.85,
    lineHeight: 1.55,
    fontSize: 13,
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

  planGrid: {
    marginTop: 16,
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

  planCardSelected: {
    border: "1px solid rgba(37,99,235,.55)",
    boxShadow: "0 8px 22px rgba(37,99,235,.10)",
  },

  planHeadRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  currentBadge: {
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    background: "rgba(15,23,42,.08)",
    color: "#334155",
    whiteSpace: "nowrap",
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

  totalBox: {
    marginTop: 12,
    display: "grid",
    gap: 10,
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    lineHeight: 1.5,
  },

  totalDivider: {
    height: 1,
    background: "rgba(17,24,39,.10)",
    marginTop: 12,
    marginBottom: 12,
  },

  totalBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },

  totalLabel: {
    fontSize: 13,
    fontWeight: 900,
    opacity: 0.8,
  },

  totalHint: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.72,
    lineHeight: 1.5,
  },

  totalPrice: {
    fontSize: 34,
    fontWeight: 900,
    lineHeight: 1,
    color: "#2563eb",
  },

  checkoutBtn: {
    width: "100%",
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    border: "none",
    background: "#111827",
    color: "#fff",
    fontWeight: 900,
    fontSize: 16,
  },
}