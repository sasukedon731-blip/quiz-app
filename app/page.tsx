"use client"

import { useState, useEffect } from "react"
import { questions, Question } from "./data/questions"

type Mode = "menu" | "normal" | "exam" | "review" | "result"

const EXAM_TIME = 20 * 60

// 配列をシャッフル
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 選択肢をシャッフルして correctIndex を補正
function shuffleQuestionChoices(question: Question): Question {
  const originalChoices = question.choices
  const shuffledChoices = shuffleArray(originalChoices)
  const correctIndex = shuffledChoices.findIndex(
    c => c === originalChoices[question.correctIndex]
  )
  return { ...question, choices: shuffledChoices, correctIndex }
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
    if (typeof window === "undefined") return
    const storedQuiz = localStorage.getItem("quizData")
    const storedIndex = localStorage.getItem("quizIndex")
    const storedScore = localStorage.getItem("quizScore")
    const storedSelected = localStorage.getItem("quizSelected")
    const storedReview = localStorage.getItem("reviewIds")

    if (storedQuiz) setQuiz(JSON.parse(storedQuiz))
    if (storedIndex) setIndex(Number(storedIndex))
    if (storedScore) setScore(Number(storedScore))
    if (storedSelected) setSelected(Number(storedSelected))
    if (storedReview) setReviewIds(JSON.parse(storedReview))
  }, [])

  // --- タイマー ---
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

  // --- モード開始時の quiz 初期化 ---
  const startMode = (newMode: Mode) => {
    let selectedQuestions: Question[] = []

    if (newMode === "normal") {
      selectedQuestions = shuffleArray(questions).map(shuffleQuestionChoices)
    } else if (newMode === "exam") {
      selectedQuestions = shuffleArray(questions)
        .slice(0, 20)
        .map(shuffleQuestionChoices)
    } else if (newMode === "review") {
      selectedQuestions = shuffleArray(
        questions.filter(q => reviewIds.includes(String(q.id)))
      ).map(shuffleQuestionChoices)
    }

    setQuiz(selectedQuestions)
    setIndex(0)
    setScore(0)
    setSelected(null)
    setMode(newMode)
    setTimeLeft(EXAM_TIME)

    // 初期化時に localStorage をクリア（新規開始）
    localStorage.removeItem("quizData")
    localStorage.removeItem("quizIndex")
    localStorage.removeItem("quizScore")
    localStorage.removeItem("quizSelected")
  }

  // --- 回答 ---
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

    // 次回の中断用に quiz 状態を保存
    localStorage.setItem("quizData", JSON.stringify(quiz))
    localStorage.setItem("quizIndex", index.toString())
    localStorage.setItem("quizScore", score.toString())
    localStorage.setItem(
      "quizSelected",
      choiceIndex !== null ? choiceIndex.toString() : ""
    )
  }

  // --- 次へ ---
  const handleNext = () => {
    setSelected(null)
    if (index + 1 < quiz.length) setIndex(i => i + 1)
    else setMode("result")
  }

  // --- 中断 ---
  const handlePause = () => {
    localStorage.setItem("quizData", JSON.stringify(quiz))
    localStorage.setItem("quizIndex", index.toString())
    localStorage.setItem("quizScore", score.toString())
    localStorage.setItem(
      "quizSelected",
      selected !== null ? selected.toString() : ""
    )
    setMode("menu")
  }

  // --- メニュー ---
  if (mode === "menu") {
    return (
      <div>
        <h1>外国免許切替クイズ</h1>
        <button onClick={() => startMode("normal")}>通常モード</button>
        <button onClick={() => startMode("exam")}>模擬試験モード</button>
        <button onClick={() => startMode("review")}>復習モード</button>
      </div>
    )
  }

  // --- 結果 ---
  if (mode === "result") {
    return (
      <div>
        <h2>結果</h2>
        <p>正解数: {score} / {quiz.length}</p>
        <button onClick={() => setMode("menu")}>メニューに戻る</button>
        <button onClick={() => startMode(mode)}>もう一度同じモードで再開</button>
      </div>
    )
  }

  // --- クイズ画面 ---
  if (quiz.length === 0 || index >= quiz.length) return <p>問題を読み込み中…</p>

  const current = quiz[index]

  return (
    <div>
      {mode === "exam" && (
        <p>残り時間: {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}</p>
      )}
      <h3>問題 {index + 1}/{quiz.length}</h3>
      <p>{current.question}</p>

      {/* 選択肢 */}
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

      {/* 正誤・解説・次へ */}
      {selected !== null && (
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <p>正解: {current.choices[current.correctIndex]}</p>
          <p>解説: {current.explanation}</p>
          <button
            onClick={handleNext}
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

      {/* 中断 */}
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
