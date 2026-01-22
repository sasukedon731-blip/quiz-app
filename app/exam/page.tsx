'use client'

import { useEffect, useState } from 'react'
import { questions, Question } from '../data/questions'

const EXAM_TIME = 20 * 60 // 20分（秒）

export default function ExamPage() {
  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)

  // 問題をランダム化
  useEffect(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setQuiz(shuffled)
  }, [])

  // タイマー
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  if (quiz.length === 0) return null

  // 時間切れ or 全問終了
  if (timeLeft <= 0 || index >= quiz.length) {
    return (
      <main>
        <div className="card">
          <h2>試験終了</h2>
          <p>スコア：{score} / {quiz.length}</p>
        </div>
      </main>
    )
  }

  const q = quiz[index]

  const answer = (i: number) => {
    if (i === q.correctIndex) {
      setScore((s) => s + 1)
    }
    setIndex((i) => i + 1)
  }

  const min = Math.floor(timeLeft / 60)
  const sec = timeLeft % 60

  return (
    <main>
      <div className="card">
        <p>
          残り時間：{min}:{sec.toString().padStart(2, '0')}
        </p>

        <p>{index + 1} / {quiz.length}</p>

        <h2>{q.question}</h2>

        {q.choices.map((c, i) => (
          <button key={i} onClick={() => answer(i)}>
            {c}
          </button>
        ))}
      </div>
    </main>
  )
}
