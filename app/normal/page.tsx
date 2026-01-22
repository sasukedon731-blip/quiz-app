'use client'

import { useState } from 'react'
import { questions } from '../data/questions'
import { saveResult } from '../lib/quizStats'

export default function NormalPage() {
  const [index, setIndex] = useState(0)
  const q = questions[index]

  const answer = (i: number) => {
    if (!q) return
    saveResult(q.id, i === q.correctIndex)
    setIndex(prev => prev + 1)
  }

  if (!q) return <p>終了</p>

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
