'use client'

import { useState } from 'react'
import type { Question } from '@/app/data/types'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'

type Props = {
  title: string
  questions: Question[]
}

export default function ExamClient({ title, questions }: Props) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const current = questions[index]

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === current.correctIndex) {
      setScore(s => s + 1)
    }
  }

  const next = () => {
    setSelected(null)
    if (index + 1 < questions.length) {
      setIndex(i => i + 1)
    } else {
      setFinished(true)
    }
  }

  if (finished) {
    return (
      <QuizLayout title="結果">
        <p>{score} / {questions.length}</p>
      </QuizLayout>
    )
  }

  return (
    <QuizLayout title={title}>
      <p>{index + 1} / {questions.length}</p>

      <h2>{current.question}</h2>

      {current.choices.map((c, i) => (
        <Button
          key={i}
          variant="choice"
          onClick={() => answer(i)}
          disabled={selected !== null}
        >
          {c}
        </Button>
      ))}

      {selected !== null && (
        <Button variant="main" onClick={next}>
          次へ
        </Button>
      )}
    </QuizLayout>
  )
}
