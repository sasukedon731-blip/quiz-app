"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"

import { auth, db } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import {
  buildEntitledQuizTypes,
  normalizeSelectedForPlan,
  type PlanId,
} from "@/app/lib/plan"

type UserDoc = {
  plan?: PlanId
  entitledQuizTypes?: QuizType[]
  selectedQuizTypes?: QuizType[]
  nextChangeAllowedAt?: any
  displayName?: string
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

  // load user doc
  useEffect(() => {
    ;(async () => {
      if (!uid) return
      setLoading(true)
      setError("")
      try {
        const snap = await getDoc(doc(db, "users", uid))
        if (!snap.exists()) {
          setError("ユーザー情報が見つかりません")
          setLoading(false)
          return
        }

        const data = snap.data() as UserDoc
        const p = (data.plan ?? "trial") as PlanId
        setPlan(p)
        setDisplayName(data.displayName ?? "")

        // entitledは無い/ズレても plan.ts から復元できる
        const entitled =
          (data.entitledQuizTypes?.length
            ? data.entitledQuizTypes
            : buildEntitledQuizTypes(p)) ?? []

        const selRaw = (data.selectedQuizTypes ?? []) as QuizType[]
        const normalized = normalizeSelectedForPlan(selRaw, entitled, p)

        setSelected(normalized)

        // ✅ 重要：selected が空だった/壊れてたユーザーを自動修復
        // （右上の“学習を始める”で詰むのを防ぐ）
        if (selRaw.length === 0 && normalized.length > 0) {
          await updateDoc(doc(db, "users", uid), {
            entitledQuizTypes: entitled,
            selectedQuizTypes: normalized,
            updatedAt: serverTimestamp(),
          })
        }
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
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>学習を始める</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
            {displayName ? `${displayName} さん / ` : ""}
            プラン：<b>{plan}</b>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {selectedCards.map((id) => {
              const q = quizzes[id]
              return (
                <div key={id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: "#fff" }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{q.title}</div>
                  {q.description && (
                    <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
                      {q.description}
                    </div>
                  )}

                  <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                    <Link href={`/normal?type=${id}`} style={btnStyle("#2563eb")}>通常</Link>
                    <Link href={`/exam?type=${id}`} style={btnStyle("#111827")}>模擬試験</Link>
                    <Link href={`/review?type=${id}`} style={btnStyle("#16a34a")}>復習</Link>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    ID: {id}
                  </div>
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
