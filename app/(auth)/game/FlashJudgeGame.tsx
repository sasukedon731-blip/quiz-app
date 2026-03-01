"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"

import type { QuizType } from "@/app/data/types"
import type { FlashJudgeQuestion, GameMode } from "./types"
import { getFlashJudgePool } from "./pools/flashJudgePools"

type Phase = "ready" | "playing" | "over"

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function FlashJudgeGame({
  quizType,
  modeParam,
}: {
  quizType: QuizType
  modeParam: string | null
}) {
  const router = useRouter()

  const params = useSearchParams()
  const phaseSection = params.get("section")

  const mode: GameMode = modeParam === "attack" ? "attack" : "normal"

  const pool = useMemo(() => {
    let list = getFlashJudgePool(quizType)
    if (quizType === "japanese-n4") {
      const section = phaseSection
      if (section && section !== "all") {
        list = list.filter((q) => q.sectionId === section)
      }
    }
    return list
  }, [quizType, phaseSection])

  const [phase, setPhase] = useState<Phase>("ready")
  const [timeLeft, setTimeLeft] = useState<number>(30)
  const [score, setScore] = useState<number>(0)
  const [combo, setCombo] = useState<number>(0)
  const [current, setCurrent] = useState<FlashJudgeQuestion | null>(null)
  const [lastMsg, setLastMsg] = useState<string>("")

  useEffect(() => {
    if (phase !== "playing") return
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

  function nextQuestion() {
    if (!pool.length) {
      setCurrent(null)
      return
    }
    setCurrent(pickRandom(pool))
  }

  function start() {
    setScore(0)
    setCombo(0)
    setLastMsg("")
    setTimeLeft(mode === "attack" ? 30 : 45)
    setPhase("playing")
    nextQuestion()
  }

  function answer(user: boolean) {
    if (!current) return

    const ok = user === current.answer
    if (ok) {
      const newCombo = combo + 1
      setCombo(newCombo)
      const bonus = newCombo >= 5 ? 2 : 1
      setScore((s) => s + 10 * bonus)
      setLastMsg(newCombo >= 5 ? `✅ 正解！(x${bonus})` : "✅ 正解！")
    } else {
      setCombo(0)
      setScore((s) => Math.max(0, s - 5))
      setLastMsg("❌ ミス！")
    }

    nextQuestion()
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <button type="button" onClick={() => {
          if (phase === "ready") {
            router.push(`/game?type=${quizType}&kind=tile-drop`)
            return
          }
          setPhase("ready")
        }} style={{ background: "transparent", border: "none", cursor: "pointer" }}>← 戻る</button>
        <div style={{ fontWeight: 700 }}>Flash Judge</div>
        <div />
      </div>

      {phase === "ready" && (
        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>瞬間判定（○ / ×）</div>
          <div style={{ opacity: 0.9, lineHeight: 1.6 }}>
            文が正しいなら <b>○</b>、間違いなら <b>×</b>。
            <br />
            コンボで加点アップ。
          </div>
          <div style={{ marginTop: 12, opacity: 0.85 }}>
            問題数：{pool.length}問（この画面はサンプル同梱。増やしてOK）
          </div>
          <button
            onClick={start}
            disabled={!pool.length}
            style={{ marginTop: 14, width: "100%", padding: "12px 14px", borderRadius: 12, fontWeight: 800 }}
          >
            {pool.length ? "スタート" : "問題がありません（テンプレから追加してね）"}
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)" }}>
              ⏱ {timeLeft}s
            </div>
            <div style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)" }}>
              🧠 score {score}
            </div>
            <div style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)" }}>
              🔥 combo {combo}
            </div>
          </div>

          <div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {current?.prompt ?? ""}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button
                onClick={() => answer(true)}
                style={{ flex: 1, padding: "14px 10px", borderRadius: 14, fontWeight: 900, fontSize: 18 }}
              >
                ○ 正しい
              </button>
              <button
                onClick={() => answer(false)}
                style={{ flex: 1, padding: "14px 10px", borderRadius: 14, fontWeight: 900, fontSize: 18 }}
              >
                × 間違い
              </button>
            </div>
            {lastMsg && <div style={{ marginTop: 10, fontWeight: 800 }}>{lastMsg}</div>}
          </div>
        </div>
      )}

      {phase === "over" && (
        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>終了！</div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>score: {score}</div>
          <button
            onClick={() => {
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
