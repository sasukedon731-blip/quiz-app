"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Card from "@/app/components/Card"
import Button from "@/app/components/Button"
import { quizCatalog } from "@/app/data/quizCatalog"
import { useAuth } from "@/app/lib/useAuth"
import { getUserEntitlement } from "@/app/lib/entitlement"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [entLoaded, setEntLoaded] = useState(false)
  const [selectedQuizTypes, setSelectedQuizTypes] = useState<string[]>([])
  const [limit, setLimit] = useState(3)

  // catalog側：有効教材（将来10+でもこれでOK）
  const enabledList = useMemo(() => {
    return quizCatalog
      .filter((q) => q.enabled)
      .sort((a, b) => a.order - b.order)
  }, [])

  // ✅ ログイン済みなら利用権を読む（TOPでも読み、表示を絞る）
  useEffect(() => {
    if (loading) return

    // 未ログインは public 側導線に任せる（あなたの構成では /login がある）
    if (!user) {
      setEntLoaded(true)
      setSelectedQuizTypes([])
      return
    }

    ;(async () => {
      try {
        const ent = await getUserEntitlement(user.uid)
        setLimit(ent.quizLimit ?? 3)
        setSelectedQuizTypes(ent.selectedQuizTypes ?? [])
      } finally {
        setEntLoaded(true)
      }
    })()
  }, [user, loading])

  // ✅ 表示する教材 = 選択済みだけ（未ログインは全部見せてもいいが、今はシンプルにガイド表示）
  const visibleList = useMemo(() => {
    if (!user) return enabledList
    const selectedSet = new Set(selectedQuizTypes)
    return enabledList.filter((q) => selectedSet.has(q.id))
  }, [enabledList, selectedQuizTypes, user])

  // ロード中
  if (loading || !entLoaded) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>クイズ学習アプリ</h1>
        <p style={{ textAlign: "center" }}>読み込み中…</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ textAlign: "center", marginBottom: 12 }}>クイズ学習アプリ</h1>

      {/* 未ログイン */}
      {!user ? (
        <Card>
          <h2 style={{ marginTop: 0 }}>ログインが必要です</h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            学習を開始するにはログインしてください。
          </p>
          <Button variant="main" onClick={() => router.push("/login")}>
            ログイン
          </Button>
          <div style={{ height: 8 }} />
          <Button variant="sub" onClick={() => router.push("/register")}>
            新規登録
          </Button>

          <hr style={{ margin: "16px 0" }} />

          <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 8 }}>
            （ログイン後は、受講する教材を最大{limit}つ選んで学習できます）
          </p>
        </Card>
      ) : selectedQuizTypes.length === 0 ? (
        // ログイン済みで未選択
        <Card>
          <h2 style={{ marginTop: 0 }}>受講する教材を選びましょう</h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            利用できる教材は最大 <b>{limit}つ</b> です。
          </p>
          <Button variant="main" onClick={() => router.push("/select-quizzes")}>
            教材を選択する
          </Button>
          <div style={{ height: 8 }} />
          <Button variant="sub" onClick={() => router.push("/mypage")}>
            マイページ
          </Button>
        </Card>
      ) : (
        // ログイン済みで選択済み
        <Card>
          <h2 style={{ marginTop: 0 }}>あなたの受講教材</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 12 }}>
            選択済み：<b>{selectedQuizTypes.length}</b> / {limit}
          </p>
          <Button variant="sub" onClick={() => router.push("/select-quizzes")}>
            教材を選び直す
          </Button>
        </Card>
      )}

      <div style={{ height: 16 }} />

      {/* ✅ 教材一覧（選択済みだけ表示） */}
      {user && selectedQuizTypes.length > 0 ? (
        <>
          <h2 style={{ marginBottom: 10 }}>学習を開始</h2>
          <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
            {visibleList.map((q) => (
              <li key={q.id} style={{ marginBottom: 12 }}>
                <button
                  onClick={() => router.push(`/select-mode?type=${encodeURIComponent(q.id)}`)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 14,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 900, marginBottom: 4 }}>{q.title}</div>
                  {q.description ? (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{q.description}</div>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 12 }}>
            <Button variant="sub" onClick={() => router.push("/mypage")}>
              マイページ
            </Button>
          </div>
        </>
      ) : (
        // 未ログイン時は全部見せてもOKだが、今は簡潔に誘導のみ
        <div style={{ color: "#6b7280", fontSize: 13, textAlign: "center" }}>
          ログインすると、選択した教材だけがここに表示されます。
        </div>
      )}
    </main>
  )
}
