"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import LockedFeature from "@/app/components/LockedFeature"

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()

  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<string | null>(null)

  const type = params?.type as string

  useEffect(() => {
    const plan = localStorage.getItem("plan") || "free"
    setUserPlan(plan)
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  // 🔥 修正ここ！！（battleだけ通す）
  if (type !== "battle" && (!userPlan || userPlan === "free")) {
    return (
      <LockedFeature
        title="日本語教材"
        description="仕事や試験で使える日本語を学べます"
      />
    )
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">クイズ画面</h1>

      <div className="bg-white p-4 rounded-xl shadow">
        クイズコンテンツ（type: {type}）
      </div>
    </main>
  )
}