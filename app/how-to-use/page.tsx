"use client"

import { useRouter } from "next/navigation"

function ActionButton({
  onClick,
  variant = "btnPrimary",
  emoji,
  labelJa,
  labelEn,
}: {
  onClick: () => void
  variant?: "btnPrimary" | "btnSub" | "btnAccent" | "btnSuccess"
  emoji: string
  labelJa: string
  labelEn: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn ${variant}`}
      style={{
        marginTop: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "16px 18px",
        textAlign: "left",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,.45)",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {emoji}
        </span>

        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 16, fontWeight: 900 }}>{labelJa}</span>
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
            {labelEn}
          </span>
        </span>
      </span>

      <span style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>›</span>
    </button>
  )
}

export default function HowToUsePage() {
  const router = useRouter()

  return (
    <main>
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>
          このアプリの使い方
        </h1>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>How to use this app</p>

        <p>
          仕事で使う日本語や資格対策を学べます。まずは無料の日本語バトルから始めてください。
        </p>
        <p style={{ color: "#6b7280" }}>
          Learn Japanese for work and exams. Start with the free Japanese Battle.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          marginBottom: 16,
        }}
      >
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
            無料でできること
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 12 }}>What you can do for free</p>

          <ul className="stackSm" style={{ color: "#111827" }}>
            <li>・日本語バトル（1日1回）</li>
            <li style={{ color: "#6b7280", fontSize: 13 }}>Play once per day</li>
          </ul>

          <ActionButton
            onClick={() => router.push("/game")}
            variant="btnPrimary"
            emoji="🎮"
            labelJa="無料で試す"
            labelEn="Try for free"
          />
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
            有料でできること
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 12 }}>Paid features</p>

          <ul className="stackSm" style={{ color: "#111827" }}>
            <li>・3 / 5 / 7教材</li>
            <li>・業種別学習</li>
            <li>・試験対策</li>
            <li>・AI会話（＋500円）</li>
          </ul>

          <ActionButton
            onClick={() => router.push("/plans")}
            variant="btnAccent"
            emoji="💰"
            labelJa="プランを見る"
            labelEn="View plans"
          />
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>使い方の流れ</h2>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>How it works</p>

        <div className="stack">
          <div className="panel">
            <p style={{ fontWeight: 900, marginBottom: 4 }}>① 日本語バトル</p>
            <p style={{ color: "#6b7280", margin: 0 }}>Free game to check your level</p>
          </div>

          <div className="panel">
            <p style={{ fontWeight: 900, marginBottom: 4 }}>② 教材で学習</p>
            <p style={{ color: "#6b7280", margin: 0 }}>Study with selected lessons</p>
          </div>

          <div className="panel">
            <p style={{ fontWeight: 900, marginBottom: 4 }}>③ 継続</p>
            <p style={{ color: "#6b7280", margin: 0 }}>Continue daily</p>
          </div>

          <div className="panel">
            <p style={{ fontWeight: 900, marginBottom: 4 }}>④ AI会話</p>
            <p style={{ color: "#6b7280", margin: 0 }}>Practice conversation</p>
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 24,
          background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
          color: "white",
          border: "none",
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
          もっと学びたい方へ
        </h2>
        <p style={{ marginBottom: 16 }}>
          有料プランで教材を選んで学習できます。
        </p>

        <div className="stackSm">
          <button
            type="button"
            className="btn"
            onClick={() => router.push("/plans")}
            style={{ background: "white", color: "#2563eb", border: "none" }}
          >
            プランを見る / View plans
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => router.push("/game")}
            style={{
              background: "rgba(255,255,255,.14)",
              color: "white",
              border: "1px solid rgba(255,255,255,.4)",
            }}
          >
            無料で試す / Try for free
          </button>
        </div>
      </div>
    </main>
  )
}