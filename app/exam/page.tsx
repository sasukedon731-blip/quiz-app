'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { quizzes } from '../data/quizzes'
import type { Question } from '../data/types'
import QuizLayout from '../components/QuizLayout'
import Button from '../components/Button'

const EXAM_TIME = 20 * 60

export default function ExamPage() {
  const router = useRouter()
  const params = useSearchParams()
  const quizType = params.get('type') as 'gaikoku' | 'japaneseN4' | null

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)
  const [mode, setMode] = useState<'quiz' | 'result'>('quiz')

  useEffect(() => {
    if (!quizType) {
      router.push('/')
      return
    }

    let questions: Question[]
    if (quizType === 'gaikoku') questions = quizzes.gaikoku.questions
    else questions = quizzes.japaneseN4.questions

    setQuiz([...questions].sort(() => Math.random() - 0.5).slice(0, 20))
  }, [quizType, router])

  useEffect(() => {
    if (mode !== 'quiz') return
    if (timeLeft <= 0) {
      setMode('result')
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, mode])

  if (quiz.length === 0) {
    return <p className="container">読み込み中...</p>
  }

  const q = quiz[index]
  const min = Math.floor(timeLeft / 60)
  const sec = timeLeft % 60

  const handleAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctIndex) setScore(s => s + 1)

    setTimeout(() => {
      setSelected(null)
      if (index + 1 < quiz.length) {
        setIndex(i => i + 1)
      } else {
        setMode('result')
      }
    }, 600)
  }

  if (mode === 'result') {
    return (
      <QuizLayout title="模擬試験 結果">
        <p>スコア：{score} / {quiz.length}</p>

        <Button
          variant="main"
          onClick={() => router.push(`/select-mode?type=${quizType}`)}
        >
          クイズ選択に戻る
        </Button>
      </QuizLayout>
    )
  }

  return (
    <QuizLayout title="模擬試験">
      <p>
        残り時間：{min}:{sec.toString().padStart(2, '0')}
      </p>

      <p>{index + 1} / {quiz.length}</p>

      <h2 className="mb-4">{q.question}</h2>

      {q.choices.map((c, i) => (
        <Button
          key={i}
          variant="choice"
          isCorrect={selected !== null && i === q.correctIndex}
          isWrong={selected !== null && i === selected && i !== q.correctIndex}
          onClick={() => handleAnswer(i)}
        >
          {c}
        </Button>
      ))}

      {/* ★ 戻るボタン */}
      <Button
        variant="accent"
        onClick={() => router.push(`/select-mode?type=${quizType}`)}
        className="mt-6"
      >
        クイズ選択に戻る
      </Button>
    </QuizLayout>
  )
}
