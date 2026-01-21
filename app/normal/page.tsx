'use client'

import { useState } from 'react'
import { questions } from '@/data/questions'
import { saveAnswerStat } from '@/lib/quizStats'

export default function Normal() {
  const [i, setI] = useState(0)
  const q = questions[i]

  function answer(n: number) {
    saveAnswerStat(q.id, n === q.answer)
    setI(i + 1)
  }

  if (!q) return <p>終了</p>

  return (
    <>
      <h2>{q.question}</h2>
      {q.choices.map((c, idx) => (
        <button key={idx} onClick={() => answer(idx)}>
          {c}
        </button>
      ))}
    </>
  )
}
