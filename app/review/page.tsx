'use client'

import { useEffect, useState } from 'react'
import { questions, Question } from '@/data/questions'
import { getReviewQuestions, saveAnswerStat } from '@/lib/quizStats'

export default function ReviewPage() {
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    setReviewQuestions(getReviewQuestions(questions))
  }, [])

  if (reviewQuestions.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        <h2>🎉 復習完了！</h2>
        <p>間違えた問題はありません。</p>
      </div>
    )
  }

  const question = reviewQuestions[index]

  const handleAnswer = (choiceIndex: number) => {
    if (showAnswer) return

    setSelected(choiceIndex)
    setShowAnswer(true)

    const isCorrect = choiceIndex === question.correctIndex
    saveAnswerStat(question.id, isCorrect)
  }

  const nextQuestion = () => {
    setSelected(null)
    setShowAnswer(false)

    const updated = getReviewQuestions(questions)
    setReviewQuestions(updated)

    if (index >= updated.length - 1) {
      setIndex(0)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>復習モード</h2>
      <p>
        問題 {index + 1} / {reviewQuestions.length}
      </p>

      <h3>{question.question}</h3>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {question.choices.map((choice, i) => {
          const isCorrect = i === question.correctIndex
          const isSelected = i === selected

          let bg = '#eee'
          if (showAnswer && isCorrect) bg = '#b6f2c2'
          if (showAnswer && isSelected && !isCorrect) bg = '#f7b2b2'

          return (
            <li key={i}>
              <button
                onClick={() => handleAnswer(i)}
                style={{
                  width: '100%',
                  margin: '6px 0',
                  padding: '10px',
                  background: bg,
                }}
              >
                {choice}
              </button>
            </li>
          )
        })}
      </ul>

      {showAnswer && (
        <>
          <p>💡 {question.explanation}</p>
          <button onClick={nextQuestion}>次の問題</button>
        </>
      )}
    </div>
  )
}
