'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Question } from '@/app/data/types'

type Props = {
  questions: Question[]
}

export default function NormalClient({ questions }: Props) {
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

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
      router.push('/')
    }
  }

  return (
    <QuizLayout title="通常モード">
      <p className="mb-2">
        {index + 1} / {questions.length}
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
