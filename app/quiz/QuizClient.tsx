'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getQuizzes } from '@/app/data/quizzes'
import type { QuizType } from '@/app/data/quizzes'
import type { Question } from '@/app/data/types'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'

export default function QuizClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') as QuizType | null

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [mode, setMode] = useState<'quiz' | 'result'>('quiz')

  useEffect(() => {
    if (!type) {
      router.push('/')
      return
    }

    const data = getQuizzes(type)

    if (data.length === 0) {
      router.push('/')
      return
    }

    const shuffled = [...data].sort(() => Math.random() - 0.5)
    setQuiz(shuffled)
  }, [type, router])

  if (quiz.length === 0) {
    return <p className="container">読み込み中...</p>
  }

  const current = quiz[index]

  const handleAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === current.correctIndex) {
      setScore(s => s + 1)
    }
  }

  const nextQuestion = () => {
    setSelected(null)
    if (index + 1 < quiz.length) {
      setIndex(i => i + 1)
    } else {
      setMode('result')
    }
  }

  if (mode === 'result') {
    return (
      <QuizLayout title="結果">
        <div className="card">
          <p>
            スコア：{score} / {quiz.length}
          </p>
        </div>

        <Button variant="main" onClick={() => router.push('/')}>
          TOPへ戻る
        </Button>
      </QuizLayout>
    )
  }

  return (
    <QuizLayout
      title={type === 'gaikoku' ? '外国免許切替クイズ' : '日本語N4クイズ'}
    >
      <p className="mb-2">
        {index + 1} / {quiz.length}
      </p>

      <h2 className="mb-4">{current.question}</h2>

      {current.choices.map((choice, i) => (
        <Button
          key={i}
          variant="choice"
          onClick={() => handleAnswer(i)}
          disabled={selected !== null}
          isCorrect={selected !== null && i === current.correctIndex}
          isWrong={selected !== null && i === selected && i !== current.correctIndex}
        >
          {choice}
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

          <Button variant="main" onClick={nextQuestion}>
            {index + 1 < quiz.length ? '次の問題へ' : '結果を見る'}
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
