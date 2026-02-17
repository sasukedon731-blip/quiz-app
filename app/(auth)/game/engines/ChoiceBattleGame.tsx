
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { QuizType } from "@/app/data/types"
import { quizzes } from "@/app/data/quizzes"

type Props = {
  quizType: QuizType
  mode: "normal" | "attack"
}

const BASE_TIME = 6
const BASE_LIFE = 3

export default function ChoiceBattleGame({ quizType }: Props) {
  const quiz = quizzes[quizType]
  const questions = quiz?.questions ?? []

  const [index, setIndex] = useState(0)
  const [life, setLife] = useState(BASE_LIFE)
  const [score, setScore] = useState(0)
  const [timeKey, setTimeKey] = useState(0)
  const [flyingChoice, setFlyingChoice] = useState<string | null>(null)
  const [explosion, setExplosion] = useState(false)

  const q = questions[index % (questions.length || 1)]
  const correct = q?.choices[q.correctIndex]

  useEffect(() => {
    if (life <= 0) alert("ゲームオーバー")
  }, [life])

  if (!q) return <div>問題がありません</div>

  function next() {
    setIndex((i) => i + 1)
    setTimeKey((k) => k + 1)
  }

  function timeout() {
    setLife((l) => l - 1)
    next()
  }

  function select(choice: string) {
    if (choice === correct) {
      setFlyingChoice(choice)
      setScore((s) => s + 100)

      setTimeout(() => {
        setExplosion(true)
        setTimeout(() => {
          setExplosion(false)
          setFlyingChoice(null)
          next()
        }, 300)
      }, 300)
    } else {
      setLife((l) => l - 1)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>❤️ {life}</div>
        <div>🏆 {score}</div>
      </div>

      {/* Time Bar */}
      <div style={{ height: 8, background: "#ddd", margin: "20px 0" }}>
        <motion.div
          key={timeKey}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: BASE_TIME, ease: "linear" }}
          onAnimationComplete={timeout}
          style={{ height: "100%", background: "red" }}
        />
      </div>

      {/* Question */}
      <div style={{ position: "relative", padding: 20, background: "#fff", textAlign: "center" }}>
        {q.question}

        <AnimatePresence>
          {explosion && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40
              }}
            >
              💥
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Choices */}
      <div style={{ marginTop: 20 }}>
        {q.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => select(c)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 10,
              padding: 10,
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Flying Copy */}
      <AnimatePresence>
        {flyingChoice && (
          <motion.div
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed",
              bottom: 120,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#2563eb",
              color: "white",
              padding: "10px 20px",
              borderRadius: 6,
              pointerEvents: "none"
            }}
          >
            {flyingChoice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
