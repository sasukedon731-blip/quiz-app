'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType, Question } from '@/app/data/types'

const STORAGE_PROGRESS_KEY = 'progress'
const STORAGE_WRONG_KEY = 'wrong'

type Props = {
  quiz: Quiz
  quizType: QuizType
}

export default function NormalClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<Question[]>([])

  // 🔹 中断復帰
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
    if (saved) {
      const { index } = JSON.parse(saved)
      setIndex(index)
    }
  }, [quizType])

  const current = quiz.questions[index]

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)

    // 間違えた問題を保存
    if (i !== current.correctIndex) {
      setWrong(prev => [...prev, current])
    }
  }

  const next = () => {
    setSelected(null)

    if (index + 1 < quiz.questions.length) {
      setIndex(prev => prev + 1)
    } else {
      // 全問終了
      localStorage.removeItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
      localStorage.setItem(`${STORAGE_WRONG_KEY}-${quizType}`, JSON.stringify(wrong))
      router.push(`/quiz?type=${quizType}`)
    }
  }

  const interrupt = () => {
    // 中断保存
    localStorage.setItem(`${STORAGE_PROGRESS_KEY}-${quizType}`, JSON.stringify({ index }))
    localStorage.setItem(`${STORAGE_WRONG_KEY}-${quizType}`, JSON.stringify(wrong))
    router.push(`/select-mode?type=${quizType}`)
  }

  return (
    <QuizLayout title={quiz.title}>
      <p>{index + 1} / {quiz.questions.length}</p>

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
        <Button variant="main" onClick={next}>
          {index + 1 < quiz.questions.length ? '次へ' : 'クイズトップに戻る'}
        </Button>
      )}

      <div className="mt-4">
        <Button variant="accent" onClick={interrupt}>
          中断する
        </Button>
        <Button variant="accent" onClick={() => router.push(`/quiz?type=${quizType}`)}>
          クイズトップに戻る
        </Button>
      </div>
    </QuizLayout>
  )
}
