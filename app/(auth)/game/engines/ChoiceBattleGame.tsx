
"use client"

import { useEffect, useMemo, useState } from "react"
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
      setScore((s) => s + 100)
      setExplosion(true)
      setTimeout(() => {
        setExplosion(false)
        next()
      }, 400)
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

      <div style={{ padding: 20, background: "#fff", textAlign: "center" }}>
        {q.question}
        <AnimatePresence>
          {explosion && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 40 }}
            >
              💥
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
    </div>
  )
}
