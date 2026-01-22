'use client'

import { useEffect, useState } from 'react'
import { questions } from '../data/questions'
import { getReviewIds } from '../lib/quizStats'

export default function ReviewPage() {
  const [ids, setIds] = useState<number[]>([])

  useEffect(() => {
    setIds(getReviewIds())
  }, [])

  const list = questions.filter(q => ids.includes(q.id))

  if (list.length === 0) {
    return <p>復習問題はありません</p>
  }

  return (
    <main>
      {list.map(q => (
        <div key={q.id}>
          <p>{q.question}</p>
        </div>
      ))}
    </main>
  )
}
