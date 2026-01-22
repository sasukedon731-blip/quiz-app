"use client"

import { useState, useEffect } from "react"
import { questions, Question } from "./data/questions"

type Mode = "menu" | "normal" | "exam" | "review" | "result"

const EXAM_TIME = 20 * 60

export default function Home() {
  const [mode, setMode] = useState<Mode>("menu")
  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [reviewIds, setReviewIds] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)

  // --- 配列をシャッフル ---
  const shuffleArray = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)

  // --- 選択肢シャッフルと正解インデックス更新 ---
  const shuffleChoices = (q: Question): Question => {
    const choices = [...q.choices]
    const correct = choices[q.correctIndex]
    const shuffled = shuffleArray(choices)
    const newIndex = shuffled.findIndex(c => c === correct)
    return { ...q, choices: shuffled, correctIndex: newIndex }
  }

  // --- 初期化・途中再開 ---
  useEffect(() => {
    if (typeof window === "undefined") return

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

  // --- 問題セット（モード変更時のみ） ---
  const initQuiz = (source: Question[]) => shuffleArray(source).map(shuffleChoices)

  useEffect(() => {
    if (mode === "normal") setQuiz(initQuiz(questions))
    else if (mode === "exam") setQuiz(initQuiz(questions).slice(0, 20))
    else if (mode === "review") {
      const reviewQs = questions.filter(q => reviewIds.includes(String(q.id)))
      setQuiz(initQuiz(reviewQs))
    }
    // index・score・selected リセット
    setIndex(0)
    setScore(0)
    setSelected(null)
  }, [mode, reviewIds])

  // --- 回答処理 ---
  const handleChoice = (choiceIndex: number) => {
    if (!quiz[index]) return
    const current = quiz[index]
    setSelected(choiceIndex)

    if (choiceIndex === current.correctIndex) {
      setScore(s => s + 1)
      const updated = reviewIds.filter(id => id !== String(current.id))
      setReviewIds(updated)
      localStorage.setItem("reviewIds", JSON.stringify(updated))
    } else {
      if (!reviewIds.includes(String(current.id))) {
        const updated = [...reviewIds, String(current.id)]
        setReviewIds(updated)
        localStorage.setItem("reviewIds", JSON.stringify(updated))
      }
    }
  }

  // --- 途中中断 ---
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

  // --- 結果 ---
  if (mode === "result") {
    return (
      <div>
        <h2>結果</h2>
        <p>正解数: {score} / {quiz.length}</p>
        <button onClick={() => setMode("menu")}>メニューに戻る</button>
      </div>
    )
  }

  if (!quiz[index]) return <p>問題を読み込み中…</p>
  const current = quiz[index]

  return (
    <div>
      {mode === "exam" && <p>残り時間: {Math.floor(timeLeft/60)}:{("0"+timeLeft%60).slice(-2)}</p>}
      <h3>問題 {index+1}/{quiz.length}</h3>
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

      {/* 中断＋始めから */}
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
            marginBottom: "10px"
          }}
        >
          一時中断
        </button>

        <br />

        <button
          onClick={() => {
            setQuiz(initQuiz(questions))
            setIndex(0)
            setScore(0)
            setSelected(null)
          }}
          style={{
            backgroundColor: "#9c27b0",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          始めから
        </button>
      </div>
    </div>
  )
}
