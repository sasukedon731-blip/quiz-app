"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function PlansPage() {
  const router = useRouter()

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [aiOption, setAiOption] = useState(false)

  const plans = [
    { id: 3, price: 500 },
    { id: 5, price: 800 },
    { id: 7, price: 1000 },
  ]

  const handleSelect = (planId: number) => {
    setSelectedPlan(planId)
  }

  const handlePurchase = () => {
    if (!selectedPlan) return
    alert(`プラン: ${selectedPlan}教材 / AI会話: ${aiOption ? "あり" : "なし"}`)
  }

  return (
    <main style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
      
      {/* 教材数 */}
      <section style={card}>
        <h3 style={title}>教材数</h3>
        <p>現在 36教材</p>
      </section>

      {/* 支払い */}
      <section style={card}>
        <h3 style={title}>お支払い方法</h3>
        <p>コンビニ・カード対応</p>
      </section>

      {/* 期間 */}
      <section style={card}>
        <h3 style={title}>期間</h3>
        <p>30日（通常）</p>
      </section>

      {/* プラン */}
      {plans.map((plan) => (
        <section
          key={plan.id}
          style={{
            ...card,
            border: selectedPlan === plan.id ? "2px solid #2563eb" : "1px solid #ddd",
          }}
        >
          <h3 style={title}>{plan.id}教材プラン</h3>
          <p>選択式で{plan.id}教材受講可能</p>

          <div style={{ fontSize: 28, fontWeight: 900 }}>
            ¥{plan.price}
            <span style={{ fontSize: 14 }}> / 30日</span>
          </div>

          <button
            style={button}
            onClick={() => handleSelect(plan.id)}
          >
            {selectedPlan === plan.id ? "選択中" : "このプランにする"}
          </button>
        </section>
      ))}

      {/* AI会話オプション */}
      <section style={{ ...card, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff" }}>
        <div style={badge}>🔥 人気No.1</div>

        <h3 style={{ ...title, color: "#fff" }}>AI会話オプション</h3>

        <p style={{ fontSize: 13 }}>
          AI会話は教材には含まれません。<br />
          プランに追加して利用できます。
        </p>

        <div style={{ fontSize: 24, fontWeight: 900 }}>+ ¥500</div>

        <button
          style={{
            ...button,
            background: aiOption ? "#16a34a" : "#fff",
            color: aiOption ? "#fff" : "#1e3a8a",
          }}
          onClick={() => setAiOption(!aiOption)}
        >
          {aiOption ? "追加済み" : "AI会話を追加する"}
        </button>

        <p style={{ fontSize: 11, marginTop: 8 }}>
          ※ 教材数には含まれません
        </p>
      </section>

      {/* 購入ボタン */}
      <button
        onClick={handlePurchase}
        style={{
          ...button,
          marginTop: 20,
          background: "#111",
          color: "#fff",
        }}
      >
        この内容で進む
      </button>

    </main>
  )
}

const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 16,
  marginBottom: 14,
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
}

const title = {
  fontSize: 16,
  fontWeight: 900,
  marginBottom: 8,
}

const button = {
  width: "100%",
  padding: "12px",
  borderRadius: 12,
  border: "none",
  marginTop: 10,
  cursor: "pointer",
  fontWeight: 700,
}

const badge = {
  fontSize: 11,
  background: "rgba(255,255,255,0.2)",
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: 999,
  marginBottom: 6,
}