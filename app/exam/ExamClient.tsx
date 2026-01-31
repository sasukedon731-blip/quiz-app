'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import { getQuizzes } from '@/app/data/quizzes'
import type { Question } from '@/app/data/types'

const EXAM_TIME = 20 * 60 // 20分（秒）

export default function ExamClient() {
  const router = useRouter()

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)
  const [finished, setFinished] = useState(false)

  // クイズ読み込み
  useEffect(() => {
    const data = getQuizzes('gaikoku') // ← 模擬試験は固定でOK
    if (data.length === 0) {
      router.push('/')
      return
    }

    const shuffled = [...data].sort(() => Math.random() - 0.5)
    setQuiz(shuffled.slice(0, 20))
  }, [router])

  // タイマー
  useEffect(() => {
    if (finished) return

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [finished])

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
      setFinished(true)
    }
  }

  // 結果画面
  if (finished) {
    return (
      <QuizLayout title="模擬試験 結果">
        <p className="mb-4">
          スコア：{score} / {quiz.length}
        </p>

        <Button variant="main" onClick={() => router.push('/')}>
          TOPへ戻る
        </Button>
      </QuizLayout>
    )
  }

  // 試験画面
  return (
    <QuizLayout title="模擬試験">
      <p className="mb-2">
        残り時間：
        {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, '0')}
      </p>

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
