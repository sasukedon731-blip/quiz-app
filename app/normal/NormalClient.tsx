'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import { getQuizzes } from '@/app/data/quizzes'
import type { Question } from '@/app/data/types'

export default function NormalClient() {
  const router = useRouter()

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  // クイズ読み込み
  useEffect(() => {
    const data = getQuizzes('gaikoku')
    if (data.length === 0) {
      router.push('/')
      return
    }

    // シャッフル
    const shuffled = [...data].sort(() => Math.random() - 0.5)
    setQuiz(shuffled)
  }, [router])

  if (quiz.length === 0) {
    return <p className="container">読み込み中...</p>
  }

  const current = quiz[index]

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === current.correctIndex) {
      setScore(s => s + 1)
    }
  }

  const next = () => {
    setSelected(null)
    if (index + 1 < quiz.length) {
      setIndex(i => i + 1)
    } else {
      router.push('/')
    }
  }

  return (
    <QuizLayout title="通常モード">
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
        <Button variant="main" onClick={next}>
          次へ
        </Button>
      )}
    </QuizLayout>
  )
}
