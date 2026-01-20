"use client"

import { useEffect, useState } from "react"
import { questions, Question } from "./data/questions"

type Mode = "menu" | "normal" | "exam" | "review" | "result"

const EXAM_TIME = 20 * 60 // 20分（秒）

export default function Home() {
  const [mode, setMode] = useState<Mode>("menu")
  const [lastMode, setLastMode] = useState<Mode>("menu")

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)

  const [choices, setChoices] = useState<string[]>([])
  const [correctIndex, setCorrectIndex] = useState(0)

  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const [correctCount, setCorrectCount] = useState(0)
  const [wrongList, setWrongList] = useState<Question[]>([])

  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)

  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)

  /* ---------- スタート ---------- */

  const reset = () => {
    setIndex(0)
    setCorrectCount(0)
    setSelected(null)
    setShowResult(false)
  }

  const startNormal = () => {
    setQuiz(shuffle(questions))
    reset()
    setLastMode("normal")
    setMode("normal")
  }

  const startExam = () => {
    setQuiz(shuffle(questions).slice(0, 20))
    reset()
    setTimeLeft(EXAM_TIME)
    setLastMode("exam")
    setMode("exam")
  }

  const startReview = () => {
    setQuiz(shuffle(wrongList))
    setWrongList([])
    reset()
    setLastMode("review")
    setMode("review")
  }

  const question = quiz[index]

  /* ---------- 選択肢 ---------- */

  useEffect(() => {
    if (!question) return
    const correct = question.choices[question.correctIndex]
    const shuffled = shuffle(question.choices)
    setChoices(shuffled)
    setCorrectIndex(shuffled.indexOf(correct))
    setSelected(null)
    setShowResult(false)
  }, [question])

  /* ---------- タイマー ---------- */

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

  /* ---------- 回答 ---------- */

  const answer = (i: number) => {
    setSelected(i)
    setShowResult(true)

    if (i === correctIndex) {
      setCorrectCount(c => c + 1)
    } else {
      setWrongList(w => [...w, question])
    }
  }

  const next = () => {
    if (index + 1 >= quiz.length) {
      setMode("result")
    } else {
      setIndex(i => i + 1)
    }
  }

  /* ---------- 画面 ---------- */

  if (mode === "menu") {
    return (
      <main style={{ padding: 20 }}>
        <h1>外国免許切替 クイズ</h1>
        <button onClick={startNormal}>▶ 通常モード</button>
        <br /><br />
        <button onClick={startExam}>
          ▶ 模擬試験モード（20問・20分）
        </button>
      </main>
    )
  }

  if (mode === "result") {
    const rate = Math.round((correctCount / quiz.length) * 100)

    return (
      <main style={{ padding: 20 }}>
        <h1>結果</h1>
        <p>正解数：{correctCount} / {quiz.length}</p>
        <p>正解率：{rate}%</p>

        {lastMode === "exam" && (
          <h2>{rate >= 90 ? "🎉 合格" : "❌ 不合格"}</h2>
        )}

        {wrongList.length > 0 && (
          <button onClick={startReview}>間違えた問題を復習</button>
        )}

        <br /><br />
        <button onClick={() => setMode("menu")}>メニューに戻る</button>
      </main>
    )
  }

  if (!question) return null

  const min = Math.floor(timeLeft / 60)
  const sec = timeLeft % 60

  return (
    <main style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>
        {mode === "exam" ? "模擬試験" : mode === "review" ? "復習" : "問題"}{" "}
        {index + 1} / {quiz.length}
      </h2>

      {mode === "exam" && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          残り時間：{min}:{sec.toString().padStart(2, "0")}
        </p>
      )}

      <p style={{ fontSize: 18 }}>{question.question}</p>

      {choices.map((c, i) => {
        let bg = "#eee"
        if (showResult) {
          if (i === correctIndex) bg = "#a7f3d0"
          if (i === selected && i !== correctIndex) bg = "#fecaca"
        }

        return (
          <button
            key={i}
            onClick={() => answer(i)}
            disabled={showResult}
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 10,
              background: bg,
              borderRadius: 6,
            }}
          >
            {c}
          </button>
        )
      })}

      {showResult && (
        <div style={{ marginTop: 20 }}>
          {question.explanation && <p>解説：{question.explanation}</p>}
          <button onClick={next}>次へ</button>
        </div>
      )}
    </main>
  )
}
