"use client"

import { useState, useEffect } from "react"
import { questions, Question } from "./data/questions"

type Mode = "menu" | "normal" | "exam" | "review" | "result"

const EXAM_TIME = 20 * 60

// ---------- utils ----------
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function shuffleQuestionChoices(q: Question): Question {
  const original = q.choices
  const shuffled = shuffleArray(original)
  const correctIndex = shuffled.findIndex(
    c => c === original[q.correctIndex]
  )
  return { ...q, choices: shuffled, correctIndex }
}

// ---------- component ----------
export default function Home() {
  const [mode, setMode] = useState<Mode>("menu")
  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [reviewIds, setReviewIds] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)

  // ---------- 初期化（途中再開用） ----------
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

  // ---------- タイマー ----------
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

  // ---------- 開始 ----------
  const startMode = (m: Mode) => {
    let list: Question[] = []

    if (m === "normal") {
      list = shuffleArray(questions).map(shuffleQuestionChoices)
    } else if (m === "exam") {
      list = shuffleArray(questions)
        .slice(0, 20)
        .map(shuffleQuestionChoices)
    } else if (m === "review") {
      list = shuffleArray(
        questions.filter(q => reviewIds.includes(String(q.id)))
      ).map(shuffleQuestionChoices)
    }

    setQuiz(list)
    setIndex(0)
    setScore(0)
    setSelected(null)
    setTimeLeft(EXAM_TIME)
    setMode(m)

    localStorage.removeItem("quizData")
    localStorage.removeItem("quizIndex")
    localStorage.removeItem("quizScore")
    localStorage.removeItem("quizSelected")
  }

  // ---------- 回答 ----------
  const handleChoice = (i: number) => {
    if (!quiz[index]) return
    const current = quiz[index]
    setSelected(i)

    if (i === current.correctIndex) {
      setScore(s => s + 1)
      const updated = reviewIds.filter(id => id !== String(current.id))
      setReviewIds(updated)
      localStorage.setItem("reviewIds", JSON.stringify(updated))
    } else if (!reviewIds.includes(String(current.id))) {
      const updated = [...reviewIds, String(current.id)]
      setReviewIds(updated)
      localStorage.setItem("reviewIds", JSON.stringify(updated))
    }

    localStorage.setItem("quizData", JSON.stringify(quiz))
    localStorage.setItem("quizIndex", index.toString())
    localStorage.setItem("quizScore", score.toString())
    localStorage.setItem("quizSelected", i.toString())
  }

  // ---------- 操作 ----------
  const handleNext = () => {
    setSelected(null)
    if (index + 1 < quiz.length) setIndex(i => i + 1)
    else setMode("result")
  }

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

  const goToTop = () => {
    setSelected(null)
    setMode("menu")
  }

  // ---------- メニュー ----------
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

  // ---------- 結果 ----------
  if (mode === "result") {
    return (
      <div>
        <h2>結果</h2>
        <p>正解数: {score} / {quiz.length}</p>
        <button onClick={goToTop}>TOPに戻る</button>
      </div>
    )
  }

  // ---------- クイズ ----------
  if (!quiz[index]) return <p>読み込み中…</p>

  const current = quiz[index]

  return (
    <div>
      {mode === "exam" && (
        <p>
          残り時間: {Math.floor(timeLeft / 60)}:
          {("0" + (timeLeft % 60)).slice(-2)}
        </p>
      )}

      <h3>問題 {index + 1} / {quiz.length}</h3>
      <p>{current.question}</p>

      {current.choices.map((c, i) => (
        <button
          key={i}
          onClick={() => handleChoice(i)}
          disabled={selected !== null}
          style={{
            display: "block",
            margin: "6px auto",
            width: "220px",
            padding: "10px",
            fontWeight: "bold",
            background:
              selected === null ? "#fff" :
              i === current.correctIndex ? "#4caf50" :
              i === selected ? "#f44336" : "#fff",
            color:
              selected === null ? "#000" :
              i === current.correctIndex || i === selected ? "#fff" : "#000",
          }}
        >
          {c}
        </button>
      ))}

      {selected !== null && (
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <p>正解: {current.choices[current.correctIndex]}</p>
          <p>解説: {current.explanation}</p>
          <button onClick={handleNext}>次へ進む</button>
        </div>
      )}

      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button onClick={handlePause}>一時中断</button>
        <br />
        <button onClick={goToTop} style={{ marginTop: "10px" }}>
          TOPに戻る
        </button>
      </div>
    </div>
  )
}
