'use client'

import { questions } from '@/app/data/questions'
import { getWrongIds } from '@/app/lib/quizStats'

export default function ReviewPage() {
  const ids = getWrongIds()
  const list = questions.filter(q => ids.includes(q.id))

  if (list.length === 0) {
    return <p>復習問題はありません</p>
  }

  return (
    <main style={{ padding: 20 }}>
      {list.map(q => (
        <div key={q.id}>
          <h3>{q.question}</h3>
          <p>正解：{q.choices[q.correctIndex]}</p>
          <p>{q.explanation}</p>
        </div>
      ))}
    </main>
  )
}
