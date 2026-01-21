'use client'

import { useEffect, useState } from 'react'
import { questions } from '@/data/questions'
import { saveAnswerStat } from '@/lib/quizStats'

const LIMIT = 20
const TIME = 20 * 60

export default function Exam() {
  const [time, setTime] = useState(TIME)
  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTime(t => t - 1), 1000)
    return () => clearInterval(t)
  }, [])

  const q = questions[i]

  function answer(n: number) {
    const ok = n === q.answer
    saveAnswerStat(q.id, ok)
    if (ok) setCorrect(c => c + 1)
    setI(i + 1)
  }

  if (i >= LIMIT || time <= 0)
    return <h2>結果：{correct} / {LIMIT}</h2>

  return (
    <>
      <p>残り時間：{time}s</p>
      <h3>{q.question}</h3>
      {q.choices.map((c, idx) => (
        <button key={idx} onClick={() => answer(idx)}>
          {c}
        </button>
      ))}
    </>
  )
}
