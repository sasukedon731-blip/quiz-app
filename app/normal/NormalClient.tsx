'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz } from '@/app/data/types'

type Props = {
  quiz: Quiz
}

export default function NormalClient({ quiz }: Props) {
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

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
      <p className="mb-2">
        {index + 1} / {quiz.questions.length}
      </p>

      <h2 className="mb-4">{current.question}</h2>

      {current.choices.map((c, i) => (
        <Button
          key={i}
          variant="choice"
          onClick={() => answer(i)}
          disabled={selected !== null}
          isCorrect={selected !== null && i === current.correctIndex}
          isWrong={selected !== null && i === selected && i !== current.correctIndex}
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
