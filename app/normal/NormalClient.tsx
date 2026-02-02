'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType } from '@/app/data/types'

const STORAGE_KEY = 'wrongQuestions'

type Props = {
  quiz: Quiz
  quizType: QuizType
}

export default function NormalClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const current = quiz.questions[index]

  // 回答処理
  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)

    if (i === current.correctIndex) {
      setScore(s => s + 1)
    }
  }

  // 次の問題
  const next = () => {
    setSelected(null)

    if (index + 1 < quiz.questions.length) {
      setIndex(i => i + 1)
    } else {
      // 全問終了 → クイズトップへ
      router.push(`/quiz?type=${quizType}`)
    }
  }

  // 中断処理（残り問題を復習へ保存）
  const interrupt = () => {
    const remaining = quiz.questions.slice(index)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining))
    router.push('/select-mode?type=' + quizType)
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
