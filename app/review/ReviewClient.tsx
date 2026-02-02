'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Question, QuizType } from '@/app/data/types'

type Props = {
  quizType: QuizType
}

export default function ReviewClient({ quizType }: Props) {
  const router = useRouter()
  const key = `wrong-${quizType}`

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const json = localStorage.getItem(key)
    if (!json) return

    const data: Question[] = JSON.parse(json)
    setQuiz(data)
  }, [key])

  if (quiz.length === 0) {
    return (
      <QuizLayout title="復習モード">
        <p>復習する問題はありません</p>
        <Button onClick={() => router.push(`/quiz?type=${quizType}`)}>
          クイズトップへ
        </Button>
      </QuizLayout>
    )
  }

  const current = quiz[index]

  return (
    <QuizLayout title="復習モード">
      <p>{index + 1} / {quiz.length}</p>
      <h2>{current.question}</h2>

      {current.choices.map((c, i) => (
        <Button key={i} variant="choice">
          {c}
        </Button>
      ))}

      <Button
        onClick={() =>
          index + 1 < quiz.length
            ? setIndex(i => i + 1)
            : router.push(`/quiz?type=${quizType}`)
        }
      >
        次へ
      </Button>
    </QuizLayout>
  )
}
