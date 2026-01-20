"use client"

import { useEffect, useState } from "react"
import { questions, Question } from "./data/questions"

type Mode = "normal" | "exam" | "review" | "result"

export default function Home() {
  const [mode, setMode] = useState<Mode>("normal")
  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)

  const [choices, setChoices] = useState<string[]>([])
  const [correctIndex, setCorrectIndex] = useState(0)

  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const [correctCount, setCorrectCount] = useState(0)
  const [wrongList, setWrongList] = useState<Question[]>([])

  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)

  const startNormal = () => {
    setQuiz(shuffle(questions))
    setMode("normal")
    reset()
  }

  const startExam = () => {
    setQuiz(shuffle(questions).slice(0, 20))
    setMode("exam")
    reset()
  }

  const startReview = () => {
    setQuiz(shuffle(wrongList))
    setWrongList([])
    setMode("review")
    reset()
  }

  const reset = () => {
    setIndex(0)
    setCorrectCount(0)
    setSelected(null)
    setShowResult(false)
  }

  const question = quiz[index]

  useEffect(() => {
    if (!question) return
    const correct = question.choices[question.correctIndex]
    const shuffled = shuffle(question.choices)
    setChoices(shuffled)
    setCorrectIndex(shuffled.indexOf(correct))
    setSelected(null)
    setShowResult(false)
  }, [question])

  const answer = (i: number) => {
    setSelected(i)
    setShowResult(true)
    if (i === correctIndex) {
      setCorrectCount((c) => c + 1)
    } else {
      setWrongList((w) => [...w, question])
    }
  }

  const next = () => {
    if (index + 1 >= quiz.length) {
      setMode("result")
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (mode === "result") {
    const rate = Math.round((correctCount / quiz.length) * 100)
    const pass = mode === "exam" && rate >= 90

    return (
      <main style={{ padding: 20 }}>
        <h1>結果</h1>
        <p>
          正解数：{correctCount} / {quiz.length}
        </p>
        <p>正解率：{rate}%</p>

        {mode === "exam" && (
          <h2>{pass ? "🎉 合格" : "❌ 不合格"}</h2>
        )}

        {wrongList.length > 0 && (
          <button onClick={startReview}>間違えた問題を復習</button>
        )}

        <div style={{ marginTop: 20 }}>
          <button onClick={startNormal}>通常モード</button>{" "}
          <button onClick={startExam}>模擬試験モード</button>
        </div>
      </main>
    )
  }

  if (!question) {
    return (
      <main style={{ padding: 20 }}>
        <h1>外国免許切替 クイズ</h1>
        <button onClick={startNormal}>▶ 通常モード</button>
        <br />
        <br />
        <button onClick={startExam}>▶ 模擬試験モード（20問）</button>
      </main>
    )
  }

  return (
    <main style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>
        {mode === "exam" ? "模擬試験" : mode === "review" ? "復習" : "問題"}{" "}
        {index + 1} / {quiz.length}
      </h2>

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
          <p>{selected === correctIndex ? "⭕ 正解" : "❌ 不正解"}</p>
          {question.explanation && <p>解説：{question.explanation}</p>}
          <button onClick={next}>次へ</button>
        </div>
      )}
    </main>
  )
}
