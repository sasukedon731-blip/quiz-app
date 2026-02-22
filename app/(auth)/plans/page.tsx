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

const PLAN_LABEL: Record<PlanId, string> = {
  trial: "お試し（無料）",
  free: "無料",
  "3": "3教材プラン",
  "5": "5教材プラン",
  all: "ALLプラン",
}

const PLAN_DESC: Record<PlanId, string> = {
  trial: "まずは1教材で体験。気に入ったらプラン変更できます。",
  free: "無料のまま使う（お試しと同等）",
  "3": "10以上の教材から3つ選んで受講",
  "5": "10以上の教材から5つ選んで受講",
  all: "全教材受講（教材追加も自動で利用可能）",
}

/**
 * ✅ 価格（30日）
 * - ブラザー要望：30日=500円 → 3教材プランを500円に設定
 * - ここだけ変えれば全表示が変わる
 */
const PRICE_YEN_30D: Record<PlanId, number> = {
  trial: 0,
  free: 0,
  "3": 500, // ✅ 30日500円
  "5": 800, // ←必要なら調整
  all: 1200, // ←必要なら調整
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

// ✅ 業種（表示＆導線）
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

  const startCheckout = async (plan: PlanId) => {
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
          // ✅ 追加：業種（API側は受け取って保存しても、無視してもOK）
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

  const handleChoose = async (plan: PlanId) => {
    if (!uid) return
    setSaving(true)
    setError("")

    try {
      if (plan === "3" || plan === "5" || plan === "all") {
        await startCheckout(plan)
        return
      }

      // trial/free（開発用）
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

  return (
    <main style={styles.main}>
      <AppHeader title="プラン" />

      {/* ✅ 業種表示（導線の一貫性） */}
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

      {/* 現在のプラン */}
      <section style={styles.card}>
        <div style={styles.cardTitle}>現在のプラン</div>
        <div style={styles.cardText}>
          {displayName ? `${displayName} さん：` : ""} <b>{PLAN_LABEL[currentPlan]}</b>
        </div>
      </section>

      {error && <p style={styles.error}>{error}</p>}

      {/* 教材数 */}
      <section style={styles.card}>
        <div style={styles.secTitle}>教材数</div>
        <div style={styles.secText}>
          現在 <b>{allCount}</b> 教材（今後10以上に拡張）
        </div>
        <div style={styles.secText}>
          3/5プランでは、ここから選んで受講できます（1ヶ月ごとに変更可能）。
        </div>
      </section>

      {/* お支払い方法（Stripe風） */}
      <section style={styles.card}>
        <div style={styles.secTitle}>お支払い方法（個人）</div>
        <div style={styles.secTextStrong}>
          外国人ユーザー向けに <b>コンビニ払い</b> をおすすめにします（カードは任意）。
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {/* convenience */}
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

          {/* card */}
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

        {/* 期間 */}
        <div style={styles.durationWrap}>
          <div style={{ fontWeight: 900, fontSize: 13 }}>期間</div>
          <div style={styles.durationRow}>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value) as any)}
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

      {/* プラン一覧（価格表示つき） */}
      <div style={styles.planGrid}>
        {(["3", "5", "all"] as PlanId[]).map((p) => {
          const isCurrent = p === currentPlan

          const base30 = PRICE_YEN_30D[p]
          const total = calcTotal(base30, durationDays)
          const perMonth = calcPerMonth(total, durationDays)
          const compareTotal = base30 * months
          const saved = Math.max(0, compareTotal - total)

          return (
            <div key={p} style={styles.planCard}>
              <div style={styles.planTitle}>{PLAN_LABEL[p]}</div>
              <div style={styles.planDesc}>{PLAN_DESC[p]}</div>

              {/* ✅ 価格ブロック */}
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

              <div style={styles.planMeta}>
                {p === "3" && "利用可能：3教材（選択式）"}
                {p === "5" && "利用可能：5教材（選択式）"}
                {p === "all" && "利用可能：全教材"}
              </div>

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

      {/* trial/free の導線（必要なら見せる：開発用） */}
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

      {/* 補足（信頼） */}
      <section style={{ ...styles.card, marginTop: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 14 }}>補足</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8, lineHeight: 1.6 }}>
          ・プラン購入後、受講する教材を選択します（3/5プランは選択式、ALLは全部利用可）。<br />
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

  // PayMethod Cards (Stripe-ish)
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
    minWidth: 0, // ✅ 折り返し崩壊防止（重要）
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
    whiteSpace: "nowrap", // ✅ “縦書き化”防止
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
}