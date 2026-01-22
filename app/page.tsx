"use client"

import { useState, useEffect } from "react"
import { questions, Question } from "./data/questions"

type Mode = "menu" | "normal" | "exam" | "review" | "result"

const EXAM_TIME = 20 * 60 // 20分（秒）

export default function Home() {
  const [mode, setMode] = useState<Mode>("menu")
  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [reviewIds, setReviewIds] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)

  // --- 初期化・途中再開 ---
  useEffect(() => {
    if (typeof window === "undefined") return // SSR回避

    const storedReview = localStorage.getItem("reviewIds")
    setReviewIds(storedReview ? JSON.parse(storedReview) : [])

    const savedMode = localStorage.getItem("quizMode")
    const savedIndex = localStorage.getItem("quizIndex")
    const savedScore = localStorage.getItem("quizScore")
    const savedSelected = localStorage.getItem("quizSelected")

    if (savedMode && savedIndex && savedScore) {
      setMode(savedMode as Mode)
      setIndex(Number(savedIndex))
      setScore(Number(savedScore))
      setSelected(savedSelected ? Number(savedSelected) : null)
    }
  }, [])

  // --- タイマー（模擬試験モード） ---
  useEffect(() => {
    if (mode !== "exam") return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          setMode("result")
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [mode])

  // --- 問題選択 ---
  useEffect(() => {
    if (mode === "normal") {
      setQuiz(questions)
    } else if (mode === "exam") {
      setQuiz(questions.slice(0, 20))
    } else if (mode === "review") {
      const reviewQuestions = questions.filter(q => reviewIds.includes(String(q.id)))
      setQuiz(reviewQuestions)
    }
  }, [mode, reviewIds])

  // --- 回答処理 ---
  const handleChoice = (choiceIndex: number) => {
    if (!quiz[index]) return
    const current = quiz[index]
    setSelected(choiceIndex)

    if (choiceIndex === current.correctIndex) {
      setScore(s => s + 1)
      // 正解なら review から削除
      const updatedReview = reviewIds.filter(id => id !== String(current.id))
      setReviewIds(updatedReview)
      localStorage.setItem("reviewIds", JSON.stringify(updatedReview))
    } else {
      // 間違えたら review に追加
      if (!reviewIds.includes(String(current.id))) {
        const updated = [...reviewIds, String(current.id)]
        setReviewIds(updated)
        localStorage.setItem("reviewIds", JSON.stringify(updated))
      }
    }

    // 選択後少し待って次の問題へ
    setTimeout(() => {
      setSelected(null)
      if (index + 1 < quiz.length) {
        setIndex(i => i + 1)
      } else {
        setMode("result")
      }
    }, 1000)
  }

  // --- 途中中断ボタン ---
  const handlePause = () => {
    localStorage.setItem("quizMode", mode)
    localStorage.setItem("quizIndex", index.toString())
    localStorage.setItem("quizScore", score.toString())
    localStorage.setItem("quizSelected", selected !== null ? selected.toString() : "")
    setMode("menu")
  }

  // --- メニュー ---
  if (mode === "menu") {
    return (
      <div>
        <h1>外国免許切替クイズ</h1>
        <button onClick={() => setMode("normal")}>通常モード</button>
        <button onClick={() => setMode("exam")}>模擬試験モード</button>
        <button onClick={() => setMode("review")}>復習モード</button>
      </div>
    )
  }

  // --- 結果画面 ---
  if (mode === "result") {
    return (
      <div>
        <h2>結果</h2>
        <p>正解数: {score} / {quiz.length}</p>
        <button onClick={() => setMode("menu")}>メニューに戻る</button>
      </div>
    )
  }

  // --- クイズ画面 ---
  if (quiz.length === 0 || index >= quiz.length) {
    return <p>問題を読み込み中…</p>
  }

  const current = quiz[index]

  return (
    <div>
      {mode === "exam" && <p>残り時間: {Math.floor(timeLeft/60)}:{("0"+timeLeft%60).slice(-2)}</p>}
      <h3>問題 {index+1}/{quiz.length}</h3>
      <p>{current.question}</p>
      <div>
        {current.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => handleChoice(i)}
            disabled={selected !== null}
            style={{
              backgroundColor:
                selected === null ? "" :
                i === current.correctIndex ? "lightgreen" :
                i === selected ? "salmon" : ""
            }}
          >
            {choice}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div>
          <p>正解: {current.choices[current.correctIndex]}</p>
          <p>解説: {current.explanation}</p>
        </div>
      )}
      <button onClick={handlePause}>一時中断</button>
    </div>
  )
}
