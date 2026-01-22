'use client'

import { useEffect, useState } from 'react'
import { questions, Question } from '../data/questions'

export default function NormalPage() {
  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setQuiz(shuffled)
  }, [])

  if (quiz.length === 0) return null

  const q = quiz[index]

  const answer = (i: number) => {
    setResult(i === q.correctIndex ? '正解！' : '不正解')
  }

  return (
    <main>
      <div className="card">
        <p>{index + 1} / {quiz.length}</p>
        <h2>{q.question}</h2>

        {q.choices.map((c, i) => (
          <button key={i} onClick={() => answer(i)}>
            {c}
          </button>
        ))}

        {result && (
          <>
            <p>{result}</p>
            <button
              onClick={() => {
                setResult(null)
                setIndex((i) => i + 1)
              }}
            >
              次へ
            </button>
          </>
        )}
      </div>
    </main>
  )
}
