"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"

import type { QuizType } from "@/app/data/types"
import type { MemoryBurstQuestion, GameMode } from "./types"
import { getMemoryBurstPool } from "./pools/memoryBurstPools"

type Phase = "ready" | "show" | "question" | "over"

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function MemoryBurstGame({
  quizType,
  modeParam,
}: {
  quizType: QuizType
  modeParam: string | null
}) {
  const router = useRouter()

  const params = useSearchParams()
  const sectionParam = params.get("section")
  const mode: GameMode = modeParam === "attack" ? "attack" : "normal"

  const pool = useMemo(() => {
    let list = getMemoryBurstPool(quizType)
    if (quizType === "japanese-n4") {
      const section = sectionParam
      if (section && section !== "all") {
        list = list.filter((q) => q.sectionId === section)
      }
    }
    return list
  }, [quizType, sectionParam])

  const [phase, setPhase] = useState<Phase>("ready")
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [score, setScore] = useState<number>(0)
  const [current, setCurrent] = useState<MemoryBurstQuestion | null>(null)
  const [feedback, setFeedback] = useState<string>("")

  useEffect(() => {
    if (phase === "ready" || phase === "over") return
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id)
          setPhase("over")
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase])

  function next() {
    if (!pool.length) {
      setCurrent(null)
      return
    }
    setFeedback("")
    const q = pickRandom(pool)
    setCurrent(q)
    setPhase("show")
    // ✅ まず表示 → 2.5秒で消す
    window.setTimeout(() => {
      setPhase((p) => (p === "show" ? "question" : p))
    }, 2500)
  }

  function start() {
    setScore(0)
    setTimeLeft(mode === "attack" ? 60 : 90)
    next()
  }

  function choose(i: number) {
    if (!current) return
    const ok = i === current.correctIndex
    if (ok) {
      setScore((s) => s + 15)
      setFeedback("✅ 正解！")
    } else {
      setScore((s) => Math.max(0, s - 5))
      setFeedback("❌ ちがう")
    }
    window.setTimeout(() => {
      if (timeLeft <= 0) return
      next()
    }, 600)
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Link href="/">← 戻る</Link>
        <div style={{ fontWeight: 700 }}>Memory Burst</div>
        <div />
      </div>

      {phase === "ready" && (
        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>一瞬表示 → 記憶で答える</div>
          <div style={{ opacity: 0.9, lineHeight: 1.6 }}>
            文章が一瞬だけ表示されます。
            <br />
            消えたあとに質問に答えてください。
          </div>
          <div style={{ marginTop: 12, opacity: 0.85 }}>問題数：{pool.length}問</div>
          <button
            onClick={() => {
                if (phase === "ready") {
                  router.push("/select-mode")
                  return
                }
                setPhase("ready")
}}
            style={{ marginTop: 14, width: "100%", padding: "12px 14px", borderRadius: 12, fontWeight: 800 }}
          >
            もう一回
          </button>
        </div>
      )}
    </div>
  )
}
