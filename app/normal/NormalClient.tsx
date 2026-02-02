'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType } from '@/app/data/types'

type Props = {
  quiz: Quiz
  quizType: QuizType
}

const STORAGE_KEY = (quizType: QuizType) =>
  `wrongQuestions-${quizType}`

export default function NormalClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const current = quiz.questions[index]

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
  }

  const next = () => {
    setSelected(null)

    if (index + 1 < quiz.questions.length) {
      setIndex(i => i + 1)
    } else {
      router.push(`/quiz?type=${quizType}`)
    }
  }

  const interrupt = () => {
    const remaining = quiz.questions.slice(index)

    localStorage.setItem(
      STORAGE_KEY(quizType),
      JSON.stringify(remaining)
    )

    router.push(`/select-mode?type=${quizType}`)
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
        <div className="mt-4">
          <p className="mb-2">
            {selected === current.correctIndex ? '⭕ 正解！' : '❌ 不正解'}
          </p>

          {current.explanation && (
            <p className="mb-4">{current.explanation}</p>
          )}

          <Button variant="main" onClick={next}>
            {index + 1 < quiz.questions.length ? '次へ' : 'クイズトップへ'}
          </Button>
        </div>
      )}

      <div className="mt-6">
        <Button variant="accent" onClick={interrupt}>
          中断する
        </Button>
      </div>
    </QuizLayout>
  )
}
