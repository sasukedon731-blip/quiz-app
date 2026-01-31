'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { quizzes } from '../data/quizzes'
import QuizLayout from '../components/QuizLayout'
import Button from '../components/Button'
import type { Question } from '../data/types'
import { useEffect, useState } from 'react'

export default function QuizClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get('type') ?? 'gaikoku'
  const quiz = quizzes[type]

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  if (!quiz) {
    return <p>クイズが見つかりません</p>
  }

  const current = quiz.questions[index]

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === current.correctIndex) {
      setScore(s => s + 1)
    }
  }

  const next = () => {
    setSelected(null)
    if (index + 1 < quiz.questions.length) {
      setIndex(i => i + 1)
    } else {
      router.push('/')
    }
  }

  return (
    <QuizLayout title={quiz.title}>
      <p>{index + 1} / {quiz.questions.length}</p>

      <h2>{current.question}</h2>

      {current.choices.map((c, i) => (
        <Button
          key={i}
          variant="choice"
          disabled={selected !== null}
          onClick={() => answer(i)}
        >
          {c}
        </Button>
      ))}

      {selected !== null && (
        <>
          <p>
            {selected === current.correctIndex ? '⭕ 正解' : '❌ 不正解'}
          </p>
          <Button variant="main" onClick={next}>
            次へ
          </Button>
        </>
      )}
    </QuizLayout>
  )
}
