"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { auth } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import { getSelectLimit, type PlanId } from "@/app/lib/plan"
import {
  loadAndRepairUserPlanState,
  saveSelectedQuizTypesWithLock,
} from "@/app/lib/userPlanState"

function canChange(now: Date, nextAllowedAt?: Date | null) {
  if (!nextAllowedAt) return true
  return now.getTime() >= nextAllowedAt.getTime()
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}/${m}/${day}`
}

export default function SelectQuizzesPage() {
  const router = useRouter()

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [plan, setPlan] = useState<PlanId>("trial")
  const [entitled, setEntitled] = useState<QuizType[]>([])
  const [selected, setSelected] = useState<QuizType[]>([])
  const [nextAllowedAt, setNextAllowedAt] = useState<Date | null>(null)

  // 1) auth
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

  // 2) load + repair
  useEffect(() => {
    ;(async () => {
      if (!uid) return
      setLoading(true)
      setError("")

      try {
        const state = await loadAndRepairUserPlanState(uid)
        setPlan(state.plan)
        setEntitled(state.entitledQuizTypes)
        setSelected(state.selectedQuizTypes)
        setNextAllowedAt(state.nextChangeAllowedAt)
      } catch (e: any) {
        console.error(e)
        setError("読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [uid])

  const now = new Date()
  const changeOk = canChange(now, nextAllowedAt)

  const limit = useMemo(() => getSelectLimit(plan), [plan])
  const maxCount = limit === "ALL" ? entitled.length : limit

  // 初回確定救済：ロック中でも必要数に達してない場合は編集OK
  const requiredCount = useMemo(() => {
    if (plan === "3") return 3
    if (plan === "5") return 5
    if (plan === "all") return entitled.length
    return 1
  }, [plan, entitled.length])

  const editable = changeOk || selected.length < requiredCount

  const remaining = useMemo(() => {
    if (limit === "ALL") return "∞"
    return Math.max(0, maxCount - selected.length)
  }, [limit, maxCount, selected.length])

  const entitledList = useMemo(() => {
    return entitled.filter((q) => quizzes[q])
  }, [entitled])

  const toggle = (q: QuizType) => {
    if (!editable) return

    setSelected((prev) => {
      const has = prev.includes(q)
      if (has) return prev.filter((x) => x !== q)

      if (limit !== "ALL" && prev.length >= maxCount) return prev
      return [...prev, q]
    })
  }

  const handleSave = async () => {
    if (!uid) return
    setSaving(true)
    setError("")

    try {
      // ✅ 保存＆ロック開始（ロック中なら延長しない）
      await saveSelectedQuizTypesWithLock({ uid, selectedQuizTypes: selected })
      router.push("/select-mode")
    } catch (e: any) {
      console.error(e)
      setError("保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 24 }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      {/* ✅ 戻る導線 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => router.push("/plans")}
          style={backBtn}
        >
          ← プランに戻る
        </button>

        <button
          onClick={() => router.push("/select-mode")}
          style={backBtn}
        >
          モード選択へ
        </button>
      </div>

      <h1 style={{ marginBottom: 12 }}>教材を選択</h1>

      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 12,
          marginBottom: 16,
          background: "#fff",
        }}
      >
        <div>
          プラン：<b>{plan}</b>
        </div>
        <div>
          選択上限：<b>{limit === "ALL" ? "ALL" : `${limit}つ`}</b>
        </div>
        <div>
          残り：<b>{remaining}</b>
        </div>

        {/* ✅ ロック表示（確定済みのときだけ） */}
        {!changeOk && nextAllowedAt && selected.length >= requiredCount && (
          <div style={{ marginTop: 8, color: "#b45309" }}>
            次に変更できる日：<b>{formatDate(nextAllowedAt)}</b>
          </div>
        )}

        {/* ✅ 初回確定救済メッセージ */}
        {!changeOk && selected.length < requiredCount && (
          <div style={{ marginTop: 8, color: "#16a34a" }}>
            ※ 初回の教材確定がまだなので、今だけ編集できます（保存後に1ヶ月ロック）
          </div>
        )}

        {(plan === "trial" || plan === "free") && (
          <div style={{ marginTop: 8, color: "#2563eb" }}>
            ※ お試し/無料は教材固定です（選択は自動で整えられます）
          </div>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {entitledList.map((q) => {
          const quiz = quizzes[q]
          const checked = selected.includes(q)

          const disabled =
            !editable || (!checked && limit !== "ALL" && selected.length >= maxCount)

          return (
            <li key={q} style={{ marginBottom: 10 }}>
              <button
                onClick={() => toggle(q)}
                disabled={disabled}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  background: checked ? "#e0f2fe" : "#fff",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.65 : 1,
                }}
              >
                <div style={{ fontWeight: 800 }}>{quiz.title}</div>
                {quiz.description && (
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    {quiz.description}
                  </div>
                )}
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                  {checked ? "✅ 選択中" : "未選択"}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <button
        onClick={handleSave}
        disabled={!editable || saving}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 14,
          border: "none",
          background: !editable ? "#9ca3af" : "#2563eb",
          color: "#fff",
          fontWeight: 900,
          marginTop: 10,
        }}
      >
        {saving
          ? "保存中..."
          : editable
            ? "この内容で保存して進む"
            : "変更可能日まで編集できません"}
      </button>
    </div>
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
