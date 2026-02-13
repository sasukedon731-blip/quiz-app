"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/app/components/Button"
import { quizCatalog } from "@/app/data/quizCatalog"
import { useAuth } from "@/app/lib/useAuth"
import { getUserEntitlement, setSelectedQuizTypes } from "@/app/lib/entitlement"

export default function SelectQuizzesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const uid = user?.uid ?? null

  const [limit, setLimit] = useState(3)
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const enabledList = useMemo(() => {
    return quizCatalog
      .filter((q) => q.enabled)
      .sort((a, b) => a.order - b.order)
  }, [])

  useEffect(() => {
    if (loading) return
    if (!uid) return

    ;(async () => {
      const ent = await getUserEntitlement(uid)
      setLimit(ent.quizLimit ?? 3)
      setSelected(ent.selectedQuizTypes ?? [])
    })()
  }, [uid, loading])

  if (loading) return <p style={{ textAlign: "center" }}>読み込み中…</p>
  if (!uid) return null

  function toggle(id: string) {
    setSelected((prev) => {
      const has = prev.includes(id)
      if (has) return prev.filter((x) => x !== id)
      if (prev.length >= limit) return prev
      return [...prev, id]
    })
  }

  async function save() {
    if (!uid) return
    setSaving(true)
    try {
      await setSelectedQuizTypes(uid, selected)
      router.replace("/") // 入口は今はTOPでOK（後でmypageに変えてもOK）
    } finally {
      setSaving(false)
    }
  }

  const canSave = selected.length > 0 && selected.length <= limit

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>
        受講する教材を選択
      </h1>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
        利用できる教材は <b>{limit}つ</b> までです（あと{" "}
        {Math.max(0, limit - selected.length)} つ選べます）
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {enabledList.map((q) => {
          const active = selected.includes(q.id)
          return (
            <button
              key={q.id}
              onClick={() => toggle(q.id)}
              style={{
                textAlign: "left",
                border: active ? "2px solid #2563eb" : "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
                background: active ? "#eff6ff" : "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 4 }}>
                {q.title} {active ? "✅" : ""}
              </div>
              {q.description ? (
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {q.description}
                </div>
              ) : null}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <Button variant="main" onClick={save} disabled={!canSave || saving}>
          {saving ? "保存中…" : "この内容で保存"}
        </Button>
        <Button variant="accent" onClick={() => router.push("/")}> 
          TOPへ戻る
        </Button>
      </div>
    </main>
  )
}
