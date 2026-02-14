"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"

type AuthState = "checking" | "guest" | "loggedIn"

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>("checking")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthState(u ? "loggedIn" : "guest")
    })
    return () => unsub()
  }, [])

  const allQuizTypes = useMemo(() => Object.keys(quizzes) as QuizType[], [])

  const startHref =
    authState === "loggedIn" ? "/select-mode" : "/register"

  const startLabel =
    authState === "loggedIn" ? "学習を始める（あなたの教材へ）" : "無料でお試し開始"

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
      {/* ヘッダー */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>
            学習クイズプラットフォーム
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.8, lineHeight: 1.6 }}>
            教材は今後10以上に拡張。まずはお試し → 気に入ったらプラン選択。
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
          {authState === "checking" ? (
            <span style={{ opacity: 0.7 }}>確認中...</span>
          ) : authState === "guest" ? (
            <>
              <Link href="/login" style={btnStyle("#111827")}>
                ログイン
              </Link>
              <Link href={startHref} style={btnStyle("#16a34a")}>
                {startLabel}
              </Link>
            </>
          ) : (
            <>
              <Link href="/mypage" style={btnStyle("#111827")}>
                マイページ
              </Link>
              <Link href="/plans" style={btnStyle("#2563eb")}>
                プラン変更
              </Link>
              <Link href={startHref} style={btnStyle("#16a34a")}>
                {startLabel}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* お試し・導線（閲覧専用TOPの説明） */}
      <section
        style={{
          marginTop: 18,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>
          まずはお試し（無料）
        </h2>
        <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.7 }}>
          このページは <b>教材のラインナップを見るためのページ</b> です。
          学習を始めるときは「学習を始める（あなたの教材へ）」から進んでください。
          <br />
          お試しは固定の1教材で体験 → 気に入ったらプランを選んで 3/5/ALL を受講できます。
        </p>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={startHref} style={btnStyle("#16a34a")}>
            {startLabel}
          </Link>
          {authState === "loggedIn" ? (
            <Link href="/select-mode" style={btnStyle("#2563eb")}>
              あなたの教材を見る
            </Link>
          ) : (
            <Link href="/register" style={btnStyle("#2563eb")}>
              登録して始める
            </Link>
          )}
        </div>
      </section>

      {/* 教材一覧（閲覧専用） */}
      <section style={{ marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: "0 0 12px", fontSize: 20 }}>
            教材一覧（閲覧用）
          </h2>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            学習する教材は「あなたの教材」画面で管理します
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {allQuizTypes.map((id) => {
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
                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
                    {q.description}
                  </div>
                )}

                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={pillStyle}>ID: {id}</span>
                  <span style={pillStyle}>問題数: {q.questions?.length ?? 0}</span>
                </div>

                <div style={{ marginTop: 12 }}>
                  {/* ✅ 学習ボタンは置かない（混乱防止） */}
                  <Link href={startHref} style={btnMini("#16a34a")}>
                    学習を始める（あなたの教材へ）
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <footer style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid #e5e7eb", opacity: 0.8 }}>
        <p style={{ margin: 0, fontSize: 13 }}>
          入口は公式LINE想定。個人＝カード決済、企業＝振込。企業には管理画面を提供予定。
        </p>
      </footer>
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
    fontSize: 14,
    textAlign: "center",
  }
}

function btnMini(bg: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "9px 10px",
    borderRadius: 12,
    background: bg,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13,
    textAlign: "center",
    width: "100%",
  }
}

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: 999,
  background: "#f3f4f6",
  fontSize: 12,
}
