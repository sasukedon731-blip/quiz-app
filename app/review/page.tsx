'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { quizzes } from '../data/quizzes'
import type { Question } from '../data/types'
import QuizLayout from '../components/QuizLayout'
import Button from '../components/Button'

/** URLで使う type */
type UrlQuizType = 'gaikoku' | 'japanese-n4'

/** quizzes の実キー */
type QuizKey = 'gaikoku' | 'japaneseN4'

/** URL → quizzesキー変換 */
const quizTypeMap: Record<UrlQuizType, QuizKey> = {
  gaikoku: 'gaikoku',
  'japanese-n4': 'japaneseN4',
}

export default function ReviewPage() {
  const router = useRouter()
  const params = useSearchParams()

  const urlType = params.get('type') as UrlQuizType | null

  if (!urlType) {
    router.push('/')
    return null
  }

  const quizKey = quizTypeMap[urlType]
  const quizData = quizzes[quizKey]

  if (!quizData) {
    router.push('/')
    return null
  }

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    const wrongIndexes = JSON.parse(
      localStorage.getItem(`wrongQuestions-${quizKey}`) || '[]'
    ) as number[]

    const reviewQuestions = wrongIndexes
      .map(i => quizData.questions[i])
      .filter(Boolean)

    setQuiz(reviewQuestions)
  }, [])

  if (quiz.length === 0) {
    return (
      <QuizLayout title="復習モード">
        <p>復習する問題はありません 🎉</p>

        <Button
          variant="main"
          onClick={() => router.push(`/select-mode?type=${urlType}`)}
        >
          クイズ選択へ戻る
        </Button>
      </QuizLayout>
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
      router.push(`/select-mode?type=${urlType}`)
    }
  }

  return (
    <QuizLayout title="復習モード">
      <p>
        問題 {index + 1} / {quiz.length}
      </p>

      <h2 className="text-lg font-medium mt-2 mb-4">
        {q.question}
      </h2>

      <div className="flex flex-col gap-3">
        {q.choices.map((c, i) => (
          <Button
            key={i}
            variant="choice"
            isCorrect={showAnswer && i === q.correctIndex}
            isWrong={showAnswer && i === selected && i !== q.correctIndex}
            onClick={() => handleAnswer(i)}
          >
            {c}
          </Button>
        ))}
      </div>

      {showAnswer && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold">
            {selected === q.correctIndex ? '⭕ 正解！' : '❌ 不正解'}
          </p>

          {q.explanation && (
            <p className="mt-2">{q.explanation}</p>
          )}

          <Button
            variant="main"
            onClick={nextQuestion}
            className="mt-3"
          >
            {index + 1 < quiz.length
              ? '次の問題へ'
              : 'クイズ選択へ戻る'}
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
