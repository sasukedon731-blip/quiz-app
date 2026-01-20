"use client"

import { useEffect, useState } from "react"
import { questions } from "./data/questions"

type Question = (typeof questions)[number]

const EXAM_TIME = 30 * 60 // 30分

export default function Home() {
  const [mode, setMode] = useState<"menu" | "study" | "exam" | "review">("menu")

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const [shuffledChoices, setShuffledChoices] = useState<string[]>([])
  const [correctChoiceIndex, setCorrectChoiceIndex] = useState(0)

  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const [correctCount, setCorrectCount] = useState(0)
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([])

  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)

  const shuffle = <T,>(array: T[]) =>
    [...array].sort(() => Math.random() - 0.5)

  /* モード開始 */
  const start = (m: typeof mode) => {
    setMode(m)
    setShuffledQuestions(shuffle(questions))
    setCurrentIndex(0)
    setCorrectCount(0)
    setWrongQuestions([])
    setTimeLeft(EXAM_TIME)
  }

  const question = shuffledQuestions[currentIndex]

  /* 問題切替 */
  useEffect(() => {
    if (!question) return
    const correct = question.choices[question.correctIndex]
    const shuffled = shuffle(question.choices)
    setShuffledChoices(shuffled)
    setCorrectChoiceIndex(shuffled.indexOf(correct))
    setSelected(null)
    setShowResult(false)
  }, [question])

  /* タイマー */
  useEffect(() => {
    if (mode !== "exam") return
    if (timeLeft <= 0) finish()

    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [mode, timeLeft])

  const answer = (index: number) => {
    setSelected(index)
    if (index === correctChoiceIndex) {
      setCorrectCount((v) => v + 1)
    } else {
      setWrongQuestions((v) => [...v, question])
    }
    setShowResult(true)
    if (mode === "exam") next()
  }

  const next = () => {
    setCurrentIndex((v) => v + 1)
  }

  const finish = () => {
    const history = JSON.parse(localStorage.getItem("history") || "[]")
    history.unshift({
      date: new Date().toLocaleString(),
      score: correctCount,
      total: shuffledQuestions.length,
    })
    localStorage.setItem("history", JSON.stringify(history.slice(0, 10)))
    setMode("menu")
  }

  /* メニュー画面 */
  if (mode === "menu") {
    const history = JSON.parse(localStorage.getItem("history") || "[]")

    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
        <h1>外国免許切替 知識試験</h1>

        <button onClick={() => start("study")} style={btn}>
          📘 学習モード
        </button>
        <button onClick={() => start("exam")} style={btn}>
          📝 模擬試験（30分）
        </button>

        {history.length > 0 && (
          <>
            <h3 style={{ marginTop: 30 }}>履歴</h3>
            {history.map((h: any, i: number) => (
              <p key={i}>
                {h.date}：{h.score}/{h.total}
              </p>
            ))}
          </>
        )}
      </main>
    )
  }

  if (!question) {
    finish()
    return null
  }

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      {mode === "exam" && (
        <div style={timer}>
          ⏱ {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </div>
      )}

      <h2>
        問題 {currentIndex + 1}/{shuffledQuestions.length}
      </h2>

      <div style={card}>
        <p style={{ fontSize: 18, fontWeight: "bold" }}>
          {question.question}
        </p>

        {question.image && (
          <img src={question.image} style={{ maxWidth: "100%" }} />
        )}
      </div>

      {shuffledChoices.map((c, i) => {
        let bg = "#f3f4f6"
        if (showResult) {
          if (i === correctChoiceIndex) bg = "#bbf7d0"
          if (i === selected && i !== correctChoiceIndex) bg = "#fecaca"
        }

        return (
          <button
            key={i}
            onClick={() => answer(i)}
            disabled={showResult && mode !== "exam"}
            style={{ ...choice, background: bg }}
          >
            {i + 1}. {c}
          </button>
        )
      })}

      {showResult && mode === "study" && (
        <div style={card}>
          <p>
            {selected === correctChoiceIndex ? "⭕ 正解" : "❌ 不正解"}
          </p>
          <p>
            <strong>解説：</strong>
            {question.explanation}
          </p>
          <button onClick={next} style={btn}>
            次へ
          </button>
        </div>
      )}
    </main>
  )
}

/* styles */
const btn = {
  width: "100%",
  padding: 12,
  marginTop: 12,
  borderRadius: 10,
  border: "none",
  fontSize: 16,
}

const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
}

const choice = {
  width: "100%",
  padding: 14,
  marginBottom: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
  textAlign: "left" as const,
}

const timer = {
  position: "fixed" as const,
  top: 10,
  right: 10,
  background: "#fee2e2",
  padding: "6px 12px",
  borderRadius: 999,
}
