"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import {
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"

import { auth, db } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"

// ------------------------------
// Plan helpers（このファイル内で完結）
// ------------------------------
type PlanId = "free" | "3" | "5" | "all"

const PLAN_LIMIT: Record<PlanId, number | "ALL"> = {
  free: 1,
  "3": 3,
  "5": 5,
  all: "ALL",
}

function getPlanLimit(plan: PlanId): number | "ALL" {
  return PLAN_LIMIT[plan] ?? 1
}

function normalizeSelected(
  selected: QuizType[],
  entitled: QuizType[],
  plan: PlanId
): QuizType[] {
  const filtered = selected.filter((q) => entitled.includes(q))

  const limit = getPlanLimit(plan)
  if (limit === "ALL") {
    return filtered.length ? filtered : entitled
  }

  const sliced = filtered.slice(0, limit)
  if (sliced.length) return sliced
  return entitled.slice(0, limit)
}

function canChange(now: Date, nextAllowedAt?: Date | null) {
  if (!nextAllowedAt) return true
  return now.getTime() >= nextAllowedAt.getTime()
}

function addOneMonth(from: Date) {
  const d = new Date(from)
  d.setMonth(d.getMonth() + 1)
  return d
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}/${m}/${day}`
}

type UserDoc = {
  plan?: PlanId
  entitledQuizTypes?: QuizType[]
  selectedQuizTypes?: QuizType[]
  nextChangeAllowedAt?: Timestamp
  displayName?: string
}

export default function SelectQuizzesPage() {
  const router = useRouter()

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [plan, setPlan] = useState<PlanId>("free")
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

  // 2) load user doc
  useEffect(() => {
    ;(async () => {
      if (!uid) return
      setLoading(true)
      setError("")

      try {
        const snap = await getDoc(doc(db, "users", uid))
        if (!snap.exists()) {
          setError("ユーザー情報が見つかりません（再登録が必要な可能性）")
          setLoading(false)
          return
        }

        const data = snap.data() as UserDoc
        const p = data.plan ?? "free"

        const entitledList =
          (data.entitledQuizTypes ?? []).filter((q) => quizzes[q]) as QuizType[]

        const fallbackAll = Object.keys(quizzes) as QuizType[]
        const e = entitledList.length ? entitledList : fallbackAll

        const s = (data.selectedQuizTypes ?? []) as QuizType[]
        const next = data.nextChangeAllowedAt?.toDate?.() ?? null

        setPlan(p)
        setEntitled(e)
        setSelected(normalizeSelected(s, e, p))
        setNextAllowedAt(next)
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

  const limit = useMemo(() => getPlanLimit(plan), [plan])
  const maxCount = limit === "ALL" ? entitled.length : limit

  // ✅ 3/5 は「必要数」未達ならロック中でも編集OK（初回確定救済）
  const requiredCount =
    plan === "3" ? 3 : plan === "5" ? 5 : plan === "all" ? entitled.length : 1

  // ロック解除条件：
  // - changeOk（通常解除） OR
  // - まだ必要数に達していない（初回確定がまだ） → 今だけ編集OK
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
      const normalized = normalizeSelected(selected, entitled, plan)

      // ✅ ここで初めて 1ヶ月ロック開始（A方針）
      const next = addOneMonth(new Date())

      await updateDoc(doc(db, "users", uid), {
        selectedQuizTypes: normalized,
        nextChangeAllowedAt: Timestamp.fromDate(next),
        updatedAt: serverTimestamp(),
      })

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
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          ← プランに戻る
        </button>

        <button
          onClick={() => router.push("/select-mode")}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
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
        {saving ? "保存中..." : editable ? "この内容で保存して進む" : "変更可能日まで編集できません"}
      </button>
    </div>
  )
}
