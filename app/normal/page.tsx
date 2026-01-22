'use client'

import { useState } from 'react'
import { questions } from '@/app/data/questions'
import { saveResult } from '@/app/lib/quizStats'

export default function NormalPage() {
  const [index, setIndex] = useState(0)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const q = questions[index]

  const answer = (i: number) => {
    if (i !== q.correctIndex) {
      setWrongIds([...wrongIds, q.id])
    }

    if (index + 1 < questions.length) {
      setIndex(index + 1)
    } else {
      saveResult(wrongIds)
      alert('終了しました')
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h2>{q.question}</h2>
      {q.choices.map((c, i) => (
        <button key={i} onClick={() => answer(i)}>
          {c}
        </button>
      ))}
    </main>
  )
}
