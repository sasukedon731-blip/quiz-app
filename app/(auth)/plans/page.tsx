"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { auth } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import { type PlanId } from "@/app/lib/plan"
import {
  loadAndRepairUserPlanState,
  savePlanAndNormalizeSelected,
} from "@/app/lib/userPlanState"

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

export default function PlansPage() {
  const router = useRouter()

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [currentPlan, setCurrentPlan] = useState<PlanId>("trial")
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

  const handleChoose = async (plan: PlanId) => {
    if (!uid) return
    setSaving(true)
    setError("")

    try {
      await savePlanAndNormalizeSelected({ uid, plan })
      if (plan === "3" || plan === "5") {
        router.push("/select-quizzes")
      } else {
        router.push("/select-mode")
      }
    } catch (e) {
      console.error(e)
      setError("プラン更新に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 24 }}>読み込み中...</div>

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>プラン選択</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
            {displayName ? `${displayName} さんの現在プラン：` : "現在プラン："}{" "}
            <b>{PLAN_LABEL[currentPlan]}</b>
          </p>
        </div>

        <button onClick={() => router.push("/mypage")} style={backBtn}>
          マイページへ
        </button>
      </header>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <section style={{ marginTop: 16, padding: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff" }}>
        <div style={{ fontWeight: 900 }}>教材数</div>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          現在 <b>{allCount}</b> 教材（今後10以上に拡張）
        </div>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          3/5プランでは、ここから選んで受講できます（1ヶ月ごとに変更可能）。
        </div>
      </section>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
        {(["trial", "3", "5", "all"] as PlanId[]).map((p) => {
          const isCurrent = p === currentPlan
          return (
            <div key={p} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 14, background: "#fff" }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{PLAN_LABEL[p]}</div>
              <div style={{ marginTop: 6, opacity: 0.8, lineHeight: 1.5 }}>{PLAN_DESC[p]}</div>

              <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
                {p === "trial" && "利用可能：固定1教材（お試し）"}
                {p === "3" && "利用可能：3教材（選択式）"}
                {p === "5" && "利用可能：5教材（選択式）"}
                {p === "all" && "利用可能：全教材"}
              </div>

              <button
                onClick={() => handleChoose(p)}
                disabled={saving || isCurrent}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 14,
                  border: "none",
                  background: isCurrent ? "#9ca3af" : "#2563eb",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: saving || isCurrent ? "not-allowed" : "pointer",
                  opacity: saving ? 0.8 : 1,
                }}
              >
                {isCurrent ? "現在のプラン" : saving ? "更新中..." : "このプランにする"}
              </button>
            </div>
          )
        })}
      </div>
    </main>
  )
}

const backBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 800,
  cursor: "pointer",
}
