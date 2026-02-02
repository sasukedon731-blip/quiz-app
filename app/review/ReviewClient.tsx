'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Question, QuizType } from '@/app/data/types'

const STORAGE_KEY = (quizType: QuizType) =>
  `wrongQuestions-${quizType}`

export default function ReviewClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const quizType = (searchParams.get('type') ??
    'gaikoku-license') as QuizType

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    const json = localStorage.getItem(STORAGE_KEY(quizType))

    if (!json) {
      router.push(`/select-mode?type=${quizType}`)
      return
    }

    try {
      const data: Question[] = JSON.parse(json)

      if (data.length === 0) {
        router.push(`/select-mode?type=${quizType}`)
        return
      }

      setQuiz(data)
    } catch {
      router.push(`/select-mode?type=${quizType}`)
    }
  }, [quizType, router])

  if (quiz.length === 0) {
    return <p className="container">読み込み中...</p>
  }

  const current = quiz[index]

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
  }

  const next = () => {
    setSelected(null)

    if (index + 1 < quiz.length) {
      setIndex(i => i + 1)
    } else {
      router.push(`/quiz?type=${quizType}`)
    }
  }

  return (
    <QuizLayout title="復習モード">
      <p className="mb-2">
        {index + 1} / {quiz.length}
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
          <p>
            {selected === current.correctIndex ? '⭕ 正解！' : '❌ 不正解'}
          </p>

          {current.explanation && (
            <p className="mt-2">{current.explanation}</p>
          )}

          <Button variant="main" onClick={next}>
            {index + 1 < quiz.length ? '次の問題へ' : 'クイズトップへ'}
          </Button>

          <Button
            variant="accent"
            onClick={() =>
              router.push(`/select-mode?type=${quizType}`)
            }
          >
            中断する
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
