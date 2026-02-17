"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import type { QuizType } from "@/app/data/types"
import { quizzes } from "@/app/data/quizzes"

type Props = {
  quizType: QuizType
  mode: "normal" | "attack"
}

type Feedback =
  | { kind: "correct"; choice: string }
  | { kind: "wrong"; choice: string }
  | null

const BASE_LIFE = 3

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function ChoiceBattleGame({ quizType, mode }: Props) {
  const quiz = quizzes[quizType]
  const pool = useMemo(() => shuffle(quiz?.questions ?? []), [quizType])

  const [index, setIndex] = useState(0)
  const [life, setLife] = useState(BASE_LIFE)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)

  const [timeKey, setTimeKey] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [phase, setPhase] = useState<"playing" | "over">("playing")

  // 時間：attackだけ徐々に短く
  const timeLimitSec = useMemo(() => {
    if (mode !== "attack") return 7
    const lvl = Math.floor(index / 3) + 1
    return clamp(7 - (lvl - 1) * 0.4, 2.8, 7)
  }, [index, mode])

  const q = pool[index % (pool.length || 1)]
  const correct = q?.choices[q.correctIndex]

  useEffect(() => {
    if (life <= 0) setPhase("over")
  }, [life])

  if (!q) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-4">
          <Link href="/select-mode" className="underline">← 戻る</Link>
        </div>
        <div>問題がありません</div>
      </div>
    )
  }

  function nextQuestion() {
    setIndex((i) => i + 1)
    setTimeKey((k) => k + 1)
    setFeedback(null)
  }

  function handleTimeout() {
    if (phase !== "playing") return
    setCombo(0)
    setLife((l) => l - 1)
    setShakeKey((k) => k + 1)
    setFeedback({ kind: "wrong", choice: "時間切れ" })
    setTimeout(() => nextQuestion(), 450)
  }

  function handleSelect(choice: string) {
    if (phase !== "playing") return
    if (feedback) return // 連打防止

    if (choice === correct) {
      const nextCombo = combo + 1
      setCombo(nextCombo)
      setScore((s) => s + 100 + Math.min(200, nextCombo * 10))
      setFeedback({ kind: "correct", choice })
      setTimeout(() => nextQuestion(), 520)
    } else {
      setCombo(0)
      setLife((l) => l - 1)
      setShakeKey((k) => k + 1)
      setFeedback({ kind: "wrong", choice })
      setTimeout(() => setFeedback(null), 520)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-28">
      {/* top bar */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <Link href="/select-mode" className="underline">← 戻る</Link>
        <div className="flex items-center gap-3">
          <div>❤️ {life}</div>
          <div>🔥 {combo}</div>
          <div>🏆 {score}</div>
        </div>
      </div>

      {/* time bar */}
      <div className="h-2 bg-gray-200 rounded overflow-hidden mb-4">
        <motion.div
          key={timeKey}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: timeLimitSec, ease: "linear" }}
          onAnimationComplete={handleTimeout}
          className="h-full bg-red-500"
        />
      </div>

      {/* question */}
      <motion.div
        key={shakeKey}
        animate={{ x: [0, -8, 8, -8, 8, 0] }}
        transition={{ duration: 0.35 }}
        className="bg-white shadow p-5 rounded text-center text-lg font-medium relative min-h-[110px] flex items-center justify-center"
      >
        <div className="whitespace-pre-wrap leading-relaxed">{q.question}</div>

        <AnimatePresence>
          {feedback?.kind === "correct" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none"
            >
              💥
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* toast */}
      <div className="mt-3 min-h-[24px] text-center text-sm">
        {feedback?.kind === "wrong" && (
          <span className="text-red-600">不正解！</span>
        )}
        {feedback?.kind === "correct" && (
          <span className="text-green-600">正解！</span>
        )}
      </div>

      {/* choices fixed bottom */}
      <div className="fixed left-0 right-0 bottom-0 bg-white/95 backdrop-blur border-t p-3">
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
          {q.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => handleSelect(c)}
              className="py-3 px-3 rounded-lg shadow bg-blue-600 hover:bg-blue-700 text-white text-sm leading-snug"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* flying copy */}
      <AnimatePresence>
        {feedback?.kind && feedback.choice && feedback.choice !== "時間切れ" && (
          <motion.div
            key={feedback.kind + feedback.choice + index}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={
              feedback.kind === "correct"
                ? { opacity: 0, y: -220, scale: 1.05 }
                : { opacity: 0, x: [0, -16, 16, -10, 10, 0], y: -40, scale: 1 }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed left-1/2 bottom-[92px] -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow pointer-events-none text-sm max-w-[86%] text-center"
          >
            {feedback.choice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* game over overlay */}
      {phase === "over" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow p-6 w-full max-w-sm text-center">
            <div className="text-xl font-semibold mb-2">ゲームオーバー</div>
            <div className="text-sm mb-4">スコア：{score}</div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPhase("playing")
                  setLife(BASE_LIFE)
                  setScore(0)
                  setCombo(0)
                  setIndex(0)
                  setTimeKey((k) => k + 1)
                  setFeedback(null)
                }}
                className="flex-1 py-2 rounded bg-blue-600 text-white"
              >
                もう一度
              </button>
              <Link href="/select-mode" className="flex-1 py-2 rounded bg-gray-800 text-white inline-flex items-center justify-center">
                戻る
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
