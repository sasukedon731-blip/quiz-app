'use client'

import { questions } from '../data/questions'
import { getWrongIds } from '../lib/quizStats'

export default function ReviewPage() {
  const ids = getWrongIds()
  const list = questions.filter(q => ids.includes(q.id))

  if (list.length === 0) {
    return <p>復習問題はありません</p>
  }

  return (
    <main>
      <h1>復習問題</h1>
      {list.map(q => (
        <section key={q.id}>
          <h3>{q.question}</h3>
          <p>正解：{q.choices[q.correctIndex]}</p>
          <p>{q.explanation}</p>
        </section>
      ))}
    </main>
  )
}
