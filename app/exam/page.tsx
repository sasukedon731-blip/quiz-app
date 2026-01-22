'use client'

import { useState } from 'react'
import { questions } from '../data/questions'

export default function ExamPage() {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)

  const q = questions[index]

  const answer = (i: number) => {
    if (!q) return
    if (i === q.correctIndex) {
      setScore(s => s + 1)
    }
    setIndex(prev => prev + 1)
  }

  if (!q) {
    return (
      <main>
        <h2>結果</h2>
        <p>{score} / {questions.length}</p>
      </main>
    )
  }

  return (
    <main>
      <h2>{q.question}</h2>
      {q.choices.map((c, i) => (
        <button key={i} onClick={() => answer(i)}>
          {c}
        </button>
      ))}
    </main>
  )
}
