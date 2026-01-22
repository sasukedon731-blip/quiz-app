'use client'

import { useState } from 'react'
import { questions } from '../data/questions'

export default function ExamPage() {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const q = questions[index]

  const answer = (i: number) => {
    if (i === q.correct) setScore((s) => s + 1)
    setIndex((prev) => prev + 1)
  }

  if (!q) {
    return <h2>結果：{score} / {questions.length}</h2>
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
