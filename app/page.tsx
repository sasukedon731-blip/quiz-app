"use client"

import { useEffect, useState } from "react"
import { questions, Question } from "./data/questions"

type Mode = "menu" | "normal" | "exam" | "review" | "result"

const EXAM_TIME = 20 * 60
const REVIEW_KEY = "reviewQuestions"

export default function Home() {
  const [mode, setMode] = useState<Mode>("menu")
  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)

  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)

  /* ======================
     復習用 localStorage
  ====================== */

  const addToReview = (id: string) => {
    const stored = localStorage.getItem(REVIEW_KEY)
    const ids: string[] = stored ? JSON.parse(stored) : []

    if (!ids.includes(id)) {
      ids.push(id)
      localStorage.setItem(REVIEW_KEY, JSON.stringify(ids))
    }
  }

  const removeFromReview = (id: string) => {
    const stored = localStorage.getItem(REVIEW_KEY)
    if (!stored) return

    const ids = JSON.parse(stored).filter((qid: string) => qid !== id)
    localStorage.setItem(REVIEW_KEY, JSON.stringify(ids))
  }

  /* ======================
     モード初期化
  ====================== */

  const startNormal = () => {
    setQuiz([...questions])
    setIndex(0)
    setScore(0)
    setSelected(null)
    setMode("normal")
  }

  const startExam = () => {
    const shuffled = [...questions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 20)

    setQuiz(shuffled)
    setIndex(0)
    setScore(0)
    setSelected(null)
    setTimeLeft(EXAM_TIME)
    setMode("exam")
  }

  const startReview = () => {
    setMode("review")
  }

  /* ======================
     復習モード読込
  ====================== */

  useEffect(() => {
    if (mode !== "review") return

    const stored = localStorage.getItem(REVIEW_KEY)
    const ids: string[] = stored ? JSON.parse(stored) : []

    const reviewQuestions = questions.filter(q =>
      ids.includes(String(q.id))
    )

    setQuiz(reviewQuestions)
    setIndex(0)
    setSelected(null)
  }, [mode])

  /* ======================
     模擬試験タイマー
  ====================== */

  useEffect(() => {
    if (mode !== "exam") return
    if (timeLeft <= 0) {
      setMode("result")
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [mode, timeLeft])

  /* ======================
     回答処理
  ====================== */

  const handleAnswer = (choiceIndex: number) => {
    if (selected !== null) return

    setSelected(choiceIndex)
    const current = quiz[index]

    if (choiceIndex === current.correctIndex) {
      setScore(s => s + 1)
      removeFromReview(String(current.id))
    } else {
      addToReview(String(current.id))
    }
  }

  const nextQuestion = () => {
    setSelected(null)

    if (index + 1 < quiz.length) {
      setIndex(i => i + 1)
    } else {
      setMode(mode === "exam" ? "result" : "menu")
    }
  }

  /* ======================
     表示
  ====================== */

  if (mode === "menu") {
    return (
      <main>
        <h1>外国免許切替 クイズ</h1>
        <button onClick={startNormal}>通常モード</button>
        <button onClick={startExam}>模擬試験（20分）</button>
        <button onClick={startReview}>復習モード</button>
      </main>
    )
  }

  if (mode === "review" && quiz.length === 0) {
    return (
      <main>
        <h2>🎉 復習する問題はありません！</h2>
        <button onClick={() => setMode("menu")}>メニューへ</button>
      </main>
    )
  }

  if (mode === "result") {
    const pass = score >= 18
    return (
      <main>
        <h2>結果</h2>
        <p>{score} / {quiz.length}</p>
        <p>{pass ? "合格 🎉" : "不合格"}</p>
        <button onClick={() => setMode("menu")}>メニューへ</button>
      </main>
    )
  }

  const q = quiz[index]

  return (
    <main>
      {mode === "exam" && (
        <p>
          残り時間：
          {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </p>
      )}

      <h2>Q{index + 1}</h2>
      <p>{q.question}</p>

      {q.choices.map((c, i) => (
        <button
          key={i}
          onClick={() => handleAnswer(i)}
          disabled={selected !== null}
          style={{
            background:
              selected === null
                ? ""
                : i === q.correctIndex
                ? "lightgreen"
                : i === selected
                ? "salmon"
                : ""
          }}
        >
          {c}
        </button>
      ))}

      {selected !== null && (
        <div>
          <button onClick={nextQuestion}>次へ</button>
        </div>
      )}
    </main>
  )
}
