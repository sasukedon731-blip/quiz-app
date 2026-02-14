// app/page.tsx
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

  const allQuizTypes = useMemo(() => {
    return Object.keys(quizzes) as QuizType[]
  }, [])

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
      {/* ヘッダー */}
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>学習クイズプラットフォーム</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
            外国免許 / 日本語 / 現場系資格など、今後10教材以上に拡張予定
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {authState === "checking" ? (
            <span style={{ opacity: 0.7 }}>確認中...</span>
          ) : authState === "guest" ? (
            <>
              <Link href="/login" style={btnStyle("#111827")}>
                ログイン
              </Link>
              <Link href="/register" style={btnStyle("#2563eb")}>
                お試しで始める（無料）
              </Link>
            </>
          ) : (
            <>
              <Link href="/mypage" style={btnStyle("#111827")}>
                マイページ
              </Link>
              <Link href="/select-mode" style={btnStyle("#2563eb")}>
                学習を開始
              </Link>
            </>
          )}
        </div>
      </header>

      {/* お試し案内 */}
      <section
        style={{
          marginTop: 18,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>まずはお試し（無料）</h2>
        <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.6 }}>
          登録すると「外国免許切替」教材で学習を体験できます。気に入ったらプランを選んで、
          3つ/5つ/ALL の教材を受講できるようにします（1ヶ月ごとに変更可能）。
        </p>
        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {authState !== "loggedIn" && (
            <Link href="/register" style={btnStyle("#16a34a")}>
              無料でお試し開始
            </Link>
          )}
          <Link href="/plans" style={btnStyle("#2563eb")}>
            プランを見る（準備中でもOK）
          </Link>
        </div>
      </section>

      {/* 教材一覧 */}
      <section style={{ marginTop: 18 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 20 }}>教材一覧（登録不要で閲覧OK）</h2>

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
                  <span style={pillStyle}>
                    問題数: {q.questions?.length ?? 0}
                  </span>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {authState === "loggedIn" ? (
                    <>
                      <Link href={`/select-mode?type=${id}`} style={btnMini("#2563eb")}>
                        この教材で学習
                      </Link>
                      <Link href={`/normal?type=${id}`} style={btnMini("#111827")}>
                        通常へ
                      </Link>
                    </>
                  ) : (
                    <Link href="/register" style={btnMini("#16a34a")}>
                      登録して試す
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* フッター */}
      <footer style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid #e5e7eb", opacity: 0.8 }}>
        <p style={{ margin: 0, fontSize: 13 }}>
          入口は公式LINE想定（後で導線追加）。個人＝カード決済、企業＝振込。企業には管理画面を提供予定。
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
  }
}

function btnMini(bg: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "8px 10px",
    borderRadius: 12,
    background: bg,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13,
  }
}

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: 999,
  background: "#f3f4f6",
  fontSize: 12,
}
