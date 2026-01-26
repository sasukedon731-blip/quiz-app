'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions, Question } from '../data/questions'

export default function ReviewPage() {
  const router = useRouter()

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    const wrongIds = JSON.parse(
      localStorage.getItem('wrongQuestions') || '[]'
    ) as number[]

    const reviewQuestions = questions.filter(q =>
      wrongIds.includes(q.id)
    )

    setQuiz(reviewQuestions)
  }, [])

  // 復習問題が0件の場合
  if (quiz.length === 0) {
    return (
      <div className="container" style={{ position: 'relative' }}>
        {/* 小さいHOMEボタン */}
        <button
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '4px 8px',
            fontSize: 12,
            borderRadius: 5,
            backgroundColor: '#2196f3',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => router.push('/')}
        >
          HOME
        </button>

        <div className="card text-center">
          <h2 className="text-xl font-bold mb-4">復習問題はありません 🎉</h2>
          <p className="mb-6">
            すべて正解しています。とても素晴らしいです！
          </p>

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
    <div className="container" style={{ position: 'relative' }}>
      {/* 小さいHOMEボタン */}
      <button
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '4px 8px',
          fontSize: 12,
          borderRadius: 5,
          backgroundColor: '#2196f3',
          color: '#fff',
          border: 'none',
          cursor: 'pointer'
        }}
        onClick={() => router.push('/')}
      >
        HOME
      </button>

      <div className="card">
        <p className="text-sm mb-2">
          復習問題 {index + 1} / {quiz.length}
        </p>

        <p className="text-lg font-bold mb-4">{q.question}</p>

        <div>
          {q.choices.map((c, i) => {
            let className = 'button button-choice'

            if (showAnswer) {
              if (i === q.correctIndex) {
                className += ' correct'
              } else if (i === selected) {
                className += ' wrong'
              }
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
        </div>

        {showAnswer && (
          <div className="mt-4">
            <p className="font-bold mb-2">
              {selected === q.correctIndex ? '⭕ 正解！' : '❌ 不正解'}
            </p>
            <p className="text-sm text-gray-700 mb-4">
              解説：{q.explanation}
            </p>

            <button
              className="button button-main"
              onClick={nextQuestion}
            >
              {index + 1 < quiz.length ? '次の問題へ' : 'TOPへ戻る'}
            </button>
          </div>
        )}
      </div>

      {/* 常時表示 TOPボタン */}
      <button
        className="button button-accent"
        onClick={() => router.push('/select-mode')}
      >
        TOPへ戻る
      </button>
    </div>
  )
}
