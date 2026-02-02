'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Question, QuizType } from '@/app/data/types'

const STORAGE_WRONG_KEY = 'wrong'

type Props = {
  quizType: QuizType
}

export default function ReviewClient({ quizType }: Props) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_WRONG_KEY}-${quizType}`)
    if (saved) {
      const data: Question[] = JSON.parse(saved)
      if (data.length === 0) {
        setQuestions([])
        return
      }
      setQuestions(data)
    } else {
      setQuestions([])
    }
  }, [quizType])

  if (!questions || questions.length === 0) {
    return (
      <QuizLayout title="復習モード">
        <p>復習する問題はありません</p>
        <Button variant="accent" onClick={() => router.push(`/quiz?type=${quizType}`)}>
          クイズトップに戻る
        </Button>
      </QuizLayout>
    )
  }

  const current = questions[index]

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
  }

  const next = () => {
    setSelected(null)
    if (index + 1 < questions.length) {
      setIndex(prev => prev + 1)
    } else {
      // 復習終了後にトップへ
      router.push(`/quiz?type=${quizType}`)
    }
  }

  return (
    <QuizLayout title="復習モード">
      <p>{index + 1} / {questions.length}</p>

      <h2>{current.question}</h2>

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
          <p>{selected === current.correctIndex ? '⭕ 正解！' : '❌ 不正解'}</p>
          {current.explanation && <p className="mt-2">{current.explanation}</p>}

          <Button variant="main" onClick={next}>
            {index + 1 < questions.length ? '次の問題へ' : 'クイズトップに戻る'}
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
