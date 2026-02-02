'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType, Question } from '@/app/data/types'

type Props = {
  quiz: Quiz
  quizType: QuizType
}

export default function NormalClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const progressKey = `progress-${quizType}`
  const wrongKey = `wrong-${quizType}`

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<Question[]>([])

  // 🔹 中断復帰
  useEffect(() => {
    const saved = localStorage.getItem(progressKey)
    if (saved) {
      const { index } = JSON.parse(saved)
      setIndex(index)
    }
  }, [progressKey])

  const current = quiz.questions[index]

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)

    if (i !== current.correctIndex) {
      setWrong(w => [...w, current])
    }
  }

  const next = () => {
    setSelected(null)

    if (index + 1 < quiz.questions.length) {
      setIndex(i => i + 1)
    } else {
      localStorage.removeItem(progressKey)
      localStorage.setItem(wrongKey, JSON.stringify(wrong))
      router.push(`/quiz?type=${quizType}`)
    }
  }

  const interrupt = () => {
    localStorage.setItem(progressKey, JSON.stringify({ index }))
    localStorage.setItem(wrongKey, JSON.stringify(wrong))
    router.push(`/quiz?type=${quizType}`)
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
          次へ
        </Button>
      )}

      <Button variant="accent" onClick={interrupt}>
        中断する
      </Button>

      <Button variant="accent" onClick={() => router.push(`/quiz?type=${quizType}`)}>
        クイズトップに戻る
      </Button>
    </QuizLayout>
  )
}
