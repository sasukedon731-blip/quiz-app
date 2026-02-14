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

  const [plan, setPlan] = useState<PlanId>("trial")
  const [selected, setSelected] = useState<QuizType[]>([])
  const [displayName, setDisplayName] = useState("")

  // auth guard
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

  // load + repair
  useEffect(() => {
    ;(async () => {
      if (!uid) return
      setLoading(true)
      setError("")
      try {
        const state = await loadAndRepairUserPlanState(uid)
        setPlan(state.plan)
        setSelected(state.selectedQuizTypes)
        setDisplayName(state.displayName)
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

  if (loading) return <div style={{ padding: 24 }}>読み込み中...</div>

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>学習を始める</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
            {displayName ? `${displayName} さん / ` : ""}
            プラン：<b>{PLAN_LABEL[plan] ?? plan}</b>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Link href="/mypage" style={btnStyle("#111827")}>マイページ</Link>
          <Link href="/plans" style={btnStyle("#2563eb")}>プラン変更</Link>
        </div>
      </header>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* selected が空のときの案内 */}
      {selectedCards.length === 0 ? (
        <section
          style={{
            marginTop: 16,
            padding: 16,
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            background: "#fff",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 16 }}>教材が選択されていません</div>
          <p style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.6 }}>
            プランに応じて教材を選んでから学習を開始できます。
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/plans" style={btnStyle("#2563eb")}>プランを確認する</Link>
            <Link href="/select-quizzes" style={btnStyle("#16a34a")}>教材を選ぶ</Link>
          </div>
        </section>
      ) : (
        <section style={{ marginTop: 16 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>あなたの教材（今月の受講）</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {selectedCards.map((id) => {
              const q = quizzes[id]
              return (
                <div
                  key={id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 14,
                    background: "#fff",
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{q.title}</div>
                  {q.description && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        opacity: 0.8,
                        lineHeight: 1.5,
                      }}
                    >
                      {q.description}
                    </div>
                  )}

                  <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                    <Link href={`/normal?type=${id}`} style={btnStyle("#2563eb")}>通常</Link>
                    <Link href={`/exam?type=${id}`} style={btnStyle("#111827")}>模擬試験</Link>
                    <Link href={`/review?type=${id}`} style={btnStyle("#16a34a")}>復習</Link>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>ID: {id}</div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <Link href="/select-quizzes" style={btnStyle("#2563eb")}>教材を選び直す</Link>
          </div>
        </section>
      )}
    </main>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 12,
    background: bg,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
    textAlign: "center",
  }
}
