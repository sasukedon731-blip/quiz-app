'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions, Question } from '../data/questions'

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

  // 初期化（シャッフル）
  useEffect(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setQuiz(shuffled)
    setSelectedAnswers(Array(shuffled.length).fill(null))
  }, [])

  // 中断復元
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

  const handleNext = () => {
    setSelected(null)
    setResult(null)

    if (index + 1 < quiz.length) {
      setIndex(prev => prev + 1)
    } else {
      localStorage.removeItem('pausedQuizNormal')
      router.push('/')
    }
  }

  const handlePause = () => {
    localStorage.setItem(
      'pausedQuizNormal',
      JSON.stringify({ index, selectedAnswers })
    )
    alert('中断しました')
    router.push('/')
  }

  return (
    <main className="container">
      <div className="card">

        {/* 🔹 ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <button
            className="button button-main"
            style={{ width: 'auto', padding: '6px 14px' }}
            onClick={() => router.push('/')}
          >
            TOPへ戻る
          </button>

          <p>{index + 1} / {quiz.length}</p>
        </div>

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
            <p>
              {result === 'correct' ? '🎉 正解！' : '❌ 不正解'}
            </p>
            {current.explanation && <p>{current.explanation}</p>}

            <button className="button button-main" onClick={handleNext}>
              次へ
            </button>
          </div>
        )}

        {/* 中断 */}
        <button className="button button-accent" onClick={handlePause}>
          中断
        </button>

      </div>
    </main>
  )
}
