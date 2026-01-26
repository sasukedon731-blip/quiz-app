'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { quizzes } from '../data/quizzes'
import type { Question } from '../data/quizzes/gaikoku-license'

interface PausedQuiz {
  index: number
  selectedAnswers: (number | null)[]
}

export default function NormalPage() {
  const router = useRouter()

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])

  /* ===== 初期化（シャッフル） ===== */
  useEffect(() => {
    const source = quizzes.gaikoku.questions
    const shuffled = [...source].sort(() => Math.random() - 0.5)

    setQuiz(shuffled)
    setSelectedAnswers(Array(shuffled.length).fill(null))
  }, [])

  /* ===== 中断復元 ===== */
  useEffect(() => {
    const paused = localStorage.getItem('pausedQuizNormal')
    if (!paused) return

    const data: PausedQuiz = JSON.parse(paused)
    if (confirm('前回のクイズを再開しますか？')) {
      setIndex(data.index)
      setSelectedAnswers(data.selectedAnswers)
    } else {
      localStorage.removeItem('pausedQuizNormal')
    }
  }, [])

  if (quiz.length === 0) {
    return <p className="container">読み込み中...</p>
  }

  const current = quiz[index]
  const isAnswered = result !== null

  /* ===== 回答 ===== */
  const handleAnswer = (i: number) => {
    if (isAnswered) return

    setSelected(i)
    setResult(i === current.correctIndex ? 'correct' : 'wrong')

    setSelectedAnswers(prev => {
      const copy = [...prev]
      copy[index] = i
      return copy
    })
  }

  /* ===== 次へ ===== */
  const handleNext = () => {
    setSelected(null)
    setResult(null)

    if (index + 1 < quiz.length) {
      setIndex(prev => prev + 1)
    } else {
      localStorage.removeItem('pausedQuizNormal')
      router.push('/select-mode')
    }
  }

  /* ===== 中断 ===== */
  const handlePause = () => {
    localStorage.setItem(
      'pausedQuizNormal',
      JSON.stringify({ index, selectedAnswers })
    )
    router.push('/select-mode')
  }

  return (
    <main>

      {/* ===== ヘッダー（cardの外に出す）===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          maxWidth: 500,
          margin: '0 auto'
        }}
      >
        <button
          className="button button-accent"
          style={{ width: 'auto', padding: '6px 14px' }}
          onClick={() => router.push('/')}
        >
          HOME
        </button>

        <p style={{ fontSize: 14 }}>
          {index + 1} / {quiz.length}
        </p>
      </div>

      {/* ===== クイズカード ===== */}
      <div className="container">
        <div className="card">

          {/* 問題 */}
          <h2>{current.question}</h2>

          {/* 選択肢 */}
          {current.choices.map((choice, i) => {
            let className = 'button button-choice'

            if (isAnswered) {
              if (i === current.correctIndex) className += ' correct'
              else if (i === selected) className += ' wrong'
            }

            return (
              <button
                key={i}
                className={className}
                disabled={isAnswered}
                onClick={() => handleAnswer(i)}
              >
                {choice}
              </button>
            )
          })}

          {/* 正誤・解説 */}
          {result && (
            <div className="card">
              <p>{result === 'correct' ? '⭕ 正解！' : '❌ 不正解'}</p>
              {current.explanation && <p>{current.explanation}</p>}

              <button className="button button-main" onClick={handleNext}>
                次へ
              </button>
            </div>
          )}

          {/* 中断 */}
          <button className="button button-accent" onClick={handlePause}>
            中断して外国免許TOPへ
          </button>

        </div>
      </div>

    </main>
  )
}
