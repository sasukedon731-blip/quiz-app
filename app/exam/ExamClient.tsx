'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz } from '@/app/data/types'

type Props = {
  quiz: Quiz
  quizType: 'gaikoku-license' | 'japanese-n4'
}

const EXAM_TIME = 20 * 60 // 20分（秒）

export default function ExamClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)
  const [finished, setFinished] = useState(false)

  const current = quiz.questions[index]

  // タイマー
  useEffect(() => {
    if (finished) return
    if (timeLeft <= 0) {
      setFinished(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, finished])

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
  }

  const next = () => {
    setSelected(null)
    if (index + 1 < quiz.questions.length) {
      setIndex(i => i + 1)
    } else {
      setFinished(true)
    }
  }

  const quit = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  if (finished) {
    return (
      <QuizLayout title={`${quiz.title}（模擬試験）`}>
        <h2>試験終了</h2>

        <Button variant="main" onClick={quit}>
          クイズトップに戻る
        </Button>
      </QuizLayout>
    )
  }

  return (
    <QuizLayout title={`${quiz.title}（模擬試験）`}>
      <p>
        {index + 1} / {quiz.questions.length}　
        残り時間：{Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, '0')}
      </p>

      <h2 className="mb-4">{current.question}</h2>

      {current.choices.map((c, i) => (
        <Button
          key={i}
          variant="choice"
          disabled={selected !== null}
          onClick={() => answer(i)}
          isCorrect={selected !== null && i === current.correctIndex}
          isWrong={selected !== null && i === selected && i !== current.correctIndex}
        >
          {c}
        </Button>
      ))}

      {selected !== null && (
        <div style={{ marginTop: 16 }}>
          <Button variant="main" onClick={next}>
            次へ
          </Button>

          <Button variant="accent" onClick={quit}>
            中断する
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
