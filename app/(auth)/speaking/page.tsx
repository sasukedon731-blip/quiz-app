"use client"

import { useEffect, useState } from "react"
import LockedFeature from "@/app/components/LockedFeature"

export default function SpeakingPage() {
  const [userPlan, setUserPlan] = useState<string | null>(null)

  useEffect(() => {
    const plan = localStorage.getItem("plan") || "free"
    setUserPlan(plan)
  }, [])

  // 🔥 AIは別課金なのでここ変える
  const hasAI = localStorage.getItem("aiOption") === "true"

  if (!hasAI) {
    return (
      <LockedFeature
        title="AI会話機能"
        description="AIと実践的な会話練習ができます（月500円）"
      />
    )
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">AI会話</h1>
      AI会話コンテンツ
    </main>
  )
}