"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import type { QuizType } from "@/app/data/types"
import type { GameMode, MemoryBurstQuestion } from "./types"
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
  const autostart = params.get("autostart") === "1"
  const mode: GameMode = modeParam === "attack" ? "attack" : "normal"
  const section = params.get("section") // いまは未使用（将来拡張用）

  const pool = useMemo(() => {
    let list = getMemoryBurstPool(quizType)
    // 将来：sectionで絞るならここ
    void section
    return list.filter((q) => q.enabled)
  }, [quizType, section])

  const [phase, setPhase] = useState<Phase>("ready")
  const [timeLeft, setTimeLeft] = useState<number>(mode === "attack" ? 60 : 90)
  const [score, setScore] = useState(0)
  const [current, setCurrent] = useState<MemoryBurstQuestion | null>(null)
  const [feedback, setFeedback] = useState<string>("")
  const [showMs] = useState<number>(2500)

  // タイマー（playing中のみ）
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

  useEffect(() => {
    if (autostart) {
      start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart])

  function start() {
    setScore(0)
    setFeedback("")
    setTimeLeft(mode === "attack" ? 60 : 90)
    const q = pickRandom(pool)
    setCurrent(q || null)
    setPhase("show")
    // show → question
    window.setTimeout(() => {
      setPhase("question")
    }, showMs)
  }

  function next() {
    const q = pickRandom(pool)
    setCurrent(q || null)
    setFeedback("")
    setPhase("show")
    window.setTimeout(() => {
      setPhase("question")
    }, showMs)
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

  const choiceStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
    fontSize: "clamp(16px, 4.8vw, 20px)",
    lineHeight: 1.2,
    textAlign: "left",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={() => router.push(`/game?type=${quizType}&kind=tile-drop`)}
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          ← 戻る
        </button>
        <div style={{ fontWeight: 700 }}>Memory Burst</div>
        <div />
      </div>

      {phase === "ready" && !autostart && (
        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>一瞬表示 → 記憶で答える</div>
          <div style={{ opacity: 0.9, lineHeight: 1.6 }}>
            文章が一瞬だけ表示されます。
            <br />
            消えたあとに質問に答えてください。
          </div>
          <div style={{ marginTop: 12, opacity: 0.85 }}>問題数：{pool.length}問</div>
          <button
            onClick={start}
            style={{ marginTop: 14, width: "100%", padding: "12px 14px", borderRadius: 12, fontWeight: 900 }}
          >
            ゲーム開始
          </button>
        </div>
      )}

      {(phase === "show" || phase === "question") && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 900 }}>残り {timeLeft}s</div>
            <div style={{ fontWeight: 900 }}>score {score}</div>
          </div>

          <div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
            {phase === "show" ? (
              <div style={{ fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 900, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {current?.displayText ?? ""}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "clamp(16px, 4.6vw, 22px)", fontWeight: 900, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {current?.question ?? ""}
                </div>
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {(current?.choices ?? []).map((c, i) => (
                    <button key={i} onClick={() => choose(i)} style={choiceStyle}>
                      {c}
                    </button>
                  ))}
                </div>
                {feedback && <div style={{ marginTop: 10, fontWeight: 900 }}>{feedback}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "over" && (
        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>終了！</div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>score: {score}</div>
          <button
            onClick={() => setPhase("ready")}
            style={{ marginTop: 14, width: "100%", padding: "12px 14px", borderRadius: 12, fontWeight: 900 }}
          >
            もう一回
          </button>
        </div>
      )}
    </div>
  )
}
