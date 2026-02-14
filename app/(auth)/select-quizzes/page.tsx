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
// Plan / Entitlement helpers
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
  // entitled外は除外
  const filtered = selected.filter((q) => entitled.includes(q))

  const limit = getPlanLimit(plan)
  if (limit === "ALL") {
    // 選択が空なら entitled 全部
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

        // entitled が空のときは、最低限「全教材」を仮で入れて落ちないようにする
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

  const remaining = useMemo(() => {
    if (limit === "ALL") return "∞"
    return Math.max(0, maxCount - selected.length)
  }, [limit, maxCount, selected.length])

  const entitledList = useMemo(() => {
    // 権限（entitled）だけを表示
    return entitled.filter((q) => quizzes[q])
  }, [entitled])

  const toggle = (q: QuizType) => {
    if (!changeOk) return

    setSelected((prev) => {
      const has = prev.includes(q)
      if (has) return prev.filter((x) => x !== q)

      // 上限ブロック
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

        {!changeOk && nextAllowedAt && (
          <div style={{ marginTop: 8, color: "#b45309" }}>
            次に変更できる日：<b>{formatDate(nextAllowedAt)}</b>
          </div>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {entitledList.map((q) => {
          const quiz = quizzes[q]
          const checked = selected.includes(q)

          const disabled =
            !changeOk ||
            (!checked && limit !== "ALL" && selected.length >= maxCount)

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
        disabled={!changeOk || saving}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 14,
          border: "none",
          background: !changeOk ? "#9ca3af" : "#2563eb",
          color: "#fff",
          fontWeight: 900,
          marginTop: 10,
        }}
      >
        {saving ? "保存中..." : changeOk ? "この内容で保存して進む" : "変更可能日まで編集できません"}
      </button>
    </div>
  )
}
