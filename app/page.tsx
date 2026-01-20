"use client"

import { useEffect, useState } from "react"
import { questions, Question } from "./data/questions"

export default function Home() {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayNumber, setDisplayNumber] = useState(1)

  const [shuffledChoices, setShuffledChoices] = useState<string[]>([])
  const [correctChoiceIndex, setCorrectChoiceIndex] = useState(0)

  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const [correctCount, setCorrectCount] = useState(0)
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([])
  const [isReviewMode, setIsReviewMode] = useState(false)

  // 配列シャッフル
  const shuffle = <T,>(array: T[]): T[] =>
    [...array].sort(() => Math.random() - 0.5)

  // 初回：問題シャッフル
  useEffect(() => {
    setShuffledQuestions(shuffle(questions))
  }, [])

  const question = shuffledQuestions[currentIndex]

  // 問題が変わったら選択肢シャッフル
  useEffect(() => {
    if (!question) return

    const correctChoice = question.choices[question.correctIndex]
    const shuffled = shuffle(question.choices)
    const newCorrectIndex = shuffled.indexOf(correctChoice)

    setShuffledChoices(shuffled)
    setCorrectChoiceIndex(newCorrectIndex)
    setSelected(null)
    setShowResult(false)
  }, [question])

  const handleAnswer = (index: number) => {
    setSelected(index)
    setShowResult(true)

    if (index === correctChoiceIndex) {
      setCorrectCount((prev) => prev + 1)
    } else {
      setWrongQuestions((prev) => [...prev, question])
    }
  }

  const nextQuestion = () => {
    setCurrentIndex((prev) => prev + 1)
    setDisplayNumber((prev) => prev + 1)
  }

  // 全問終了画面
  if (displayNumber > shuffledQuestions.length && shuffledQuestions.length > 0) {
    const total = shuffledQuestions.length
    const rate = Math.round((correctCount / total) * 100)

    return (
      <main style={{ padding: 20 }}>
        <h1>全問終了！</h1>
        <p>正解数：{correctCount} / {total}</p>
        <p>正解率：{rate}%</p>

        {wrongQuestions.length > 0 && (
          <button
            style={{ marginTop: 20, padding: "10px 20px" }}
            onClick={() => {
              setShuffledQuestions(shuffle(wrongQuestions))
              setWrongQuestions([])
              setCurrentIndex(0)
              setDisplayNumber(1)
              setCorrectCount(0)
              setIsReviewMode(true)
            }}
          >
            ❌ 間違えた問題を復習する
          </button>
        )}
      </main>
    )
  }

  if (!question) {
    return <main style={{ padding: 20 }}>読み込み中...</main>
  }

  return (
    <main style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>
        {isReviewMode ? "復習" : "問題"} {displayNumber} /{" "}
        {shuffledQuestions.length}
      </h2>

      <p style={{ fontSize: 18 }}>{question.question}</p>

      {shuffledChoices.map((choice, index) => {
        let bg = "#eee"
        if (showResult) {
          if (index === correctChoiceIndex) bg = "#a7f3d0"
          if (index === selected && index !== correctChoiceIndex)
            bg = "#fecaca"
        }

        return (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={showResult}
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 10,
              backgroundColor: bg,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          >
            {choice}
          </button>
        )
      })}

      {showResult && (
        <div style={{ marginTop: 20 }}>
          <p>
            {selected === correctChoiceIndex ? "⭕ 正解！" : "❌ 不正解"}
          </p>
          <p>
            <strong>正解：</strong>
            {shuffledChoices[correctChoiceIndex]}
          </p>
          {question.explanation && (
            <p>
              <strong>解説：</strong>
              {question.explanation}
            </p>
          )}
          <button
            onClick={nextQuestion}
            style={{ marginTop: 20, padding: "10px 20px" }}
          >
            次へ
          </button>
        </div>
      )}
    </main>
  )
}
