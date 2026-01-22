"use client"

import { useState, useEffect } from "react"
import { questions, Question } from "./data/questions"

type Mode = "menu" | "normal" | "exam" | "review" | "result"

const EXAM_TIME = 20 * 60 // 20分（秒）

// --- ヘルパー関数 ---
// 配列をシャッフル
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 問題の選択肢をシャッフルして correctIndex を補正
function shuffleQuestionChoices(question: Question): Question {
  const originalChoices = question.choices
  const shuffledChoices = shuffleArray(originalChoices)
  const correctIndex = shuffledChoices.findIndex(
    c => c === originalChoices[question.correctIndex]
  )
  return {
    ...question,
    choices: shuffledChoices,
    correctIndex,
  }
}

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

  // --- 問題・選択肢ランダム化 ---
  useEffect(() => {
    if (mode === "normal") {
      setQuiz(shuffleArray(questions).map(shuffleQuestionChoices))
    } else if (mode === "exam") {
      setQuiz(
        shuffleArray(questions)
          .slice(0, 20)
          .map(shuffleQuestionChoices)
      )
    } else if (mode === "review") {
      const reviewQuestions = questions
        .filter(q => reviewIds.includes(String(q.id)))
        .map(shuffleQuestionChoices)
      setQuiz(shuffleArray(reviewQuestions))
    }
    setIndex(0)
    setScore(0)
    setSelected(null)
    setTimeLeft(EXAM_TIME)
  }, [mode, reviewIds])

  // --- 回答処理 ---
  const handleChoice = (choiceIndex: number) => {
    if (!quiz[index]) return
    const current = quiz[index]
    setSelected(choiceIndex)

    if (choiceIndex === current.correctIndex) {
      setScore(s => s + 1)
      const updatedReview = reviewIds.filter(id => id !== String(current.id))
      setReviewIds(updatedReview)
      localStorage.setItem("reviewIds", JSON.stringify(updatedReview))
    } else {
      if (!reviewIds.includes(String(current.id))) {
        const updated = [...reviewIds, String(current.id)]
        setReviewIds(updated)
        localStorage.setItem("reviewIds", JSON.stringify(updated))
      }
    }
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
        <button onClick={() => setMode(mode)}>もう一度同じモードで再開</button>
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
      {mode === "exam" && (
        <p>残り時間: {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}</p>
      )}
      <h3>問題 {index + 1}/{quiz.length}</h3>
      <p>{current.question}</p>

      {/* 選択肢ボタン */}
      <div>
        {current.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => handleChoice(i)}
            disabled={selected !== null}
            style={{
              display: "block",
              margin: "5px auto",
              width: "200px",
              padding: "8px 12px",
              backgroundColor:
                selected === null ? "#fff" :
                i === current.correctIndex ? "#4caf50" :
                i === selected ? "#f44336" : "#fff",
              color:
                selected === null ? "#000" :
                i === current.correctIndex ? "#fff" :
                i === selected ? "#fff" : "#000",
              border: "1px solid #999",
              borderRadius: "5px",
              cursor: selected === null ? "pointer" : "default",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {choice}
          </button>
        ))}
      </div>

      {/* 正誤表示・解説・次へ進むボタン */}
      {selected !== null && (
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <p>正解: {current.choices[current.correctIndex]}</p>
          <p>解説: {current.explanation}</p>
          <button
            onClick={() => {
              setSelected(null)
              if (index + 1 < quiz.length) setIndex(i => i + 1)
              else setMode("result")
            }}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              borderRadius: "5px",
              backgroundColor: "#2196f3",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            次へ進む
          </button>
        </div>
      )}

      {/* 中断ボタン */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button
          onClick={handlePause}
          style={{
            backgroundColor: "#ff9800",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          一時中断
        </button>
      </div>
    </div>
  )
}
