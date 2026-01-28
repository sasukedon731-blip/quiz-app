'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { quizzes } from '../data/quizzes'
import type { Question } from '../data/types'

export default function ReviewPage() {
  const router = useRouter()

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  /* ===== 復習データ取得 ===== */
  useEffect(() => {
    const wrongIndexes = JSON.parse(
      localStorage.getItem('wrongQuestions') || '[]'
    ) as number[]

    const source = quizzes.gaikoku.questions
    const reviewQuestions = wrongIndexes
      .map(i => source[i])
      .filter(Boolean)

    setQuiz(reviewQuestions)
  }, [])

  /* ===== 復習問題なし ===== */
  if (quiz.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h2>復習問題はありません 🎉</h2>
          <p>すべて正解しています。素晴らしいです！</p>

          <button
            className="button button-main"
            onClick={() => router.push('/select-mode')}
          >
            TOPへ戻る
          </button>
        </div>
      </div>
    )
  }

  const q = quiz[index]

  const handleAnswer = (i: number) => {
    if (showAnswer) return
    setSelected(i)
    setShowAnswer(true)
  }

  const nextQuestion = () => {
    setSelected(null)
    setShowAnswer(false)

    if (index + 1 < quiz.length) {
      setIndex(i => i + 1)
    } else {
      router.push('/select-mode')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <p>
          復習問題 {index + 1} / {quiz.length}
        </p>

        <h2>{q.question}</h2>

        {q.choices.map((c, i) => {
          let className = 'button button-choice'

          if (showAnswer) {
            if (i === q.correctIndex) className += ' correct'
            else if (i === selected) className += ' wrong'
          }

          return (
            <button
              key={i}
              className={className}
              onClick={() => handleAnswer(i)}
            >
              {c}
            </button>
          )
        })}

        {showAnswer && (
          <div className="card">
            <p>
              {selected === q.correctIndex
                ? '⭕ 正解！'
                : '❌ 不正解'}
            </p>

            {q.explanation && <p>{q.explanation}</p>}

            <button
              className="button button-main"
              onClick={nextQuestion}
            >
              {index + 1 < quiz.length ? '次の問題へ' : 'TOPへ戻る'}
            </button>
          </div>
        )}
      </div>

      <button
        className="button button-accent"
        onClick={() => router.push('/select-mode')}
      >
        TOPへ戻る
      </button>
    </div>
  )
}
