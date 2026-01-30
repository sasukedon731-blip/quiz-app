'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { quizzes } from '../data/quizzes'
import type { Question } from '../data/types'
import QuizLayout from '../components/QuizLayout'
import Button from '../components/Button'

/** URLで使うtype */
type UrlQuizType = 'gaikoku' | 'japanese-n4'

/** quizzes の実キー */
type QuizKey = 'gaikoku' | 'japaneseN4'

/** URL → データキー変換 */
const quizTypeMap: Record<UrlQuizType, QuizKey> = {
  gaikoku: 'gaikoku',
  'japanese-n4': 'japaneseN4',
}

export default function NormalPage() {
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

  const STORAGE_KEY = `normal-progress-${quizKey}`

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  /** 初期化 or 中断復元 */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      setQuiz(parsed.quiz)
      setIndex(parsed.index)
      return
    }

    const shuffled = [...quizData.questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 50)

    setQuiz(shuffled)
    setIndex(0)
  }, [])

  if (quiz.length === 0) {
    return <p className="container">読み込み中...</p>
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
      localStorage.removeItem(STORAGE_KEY)
      router.push(`/select-mode?type=${urlType}`)
    }
  }

  /** 中断（保存） */
  const quitWithSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ quiz, index })
    )
    router.push(`/select-mode?type=${urlType}`)
  }

  /** TOPへ（破棄） */
  const quitToTop = () => {
    localStorage.removeItem(STORAGE_KEY)
    router.push('/')
  }

  return (
    <QuizLayout
      title={
        quizKey === 'gaikoku'
          ? '外国免許切替クイズ（通常）'
          : '日本語N4クイズ（通常）'
      }
    >
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
              : 'モード選択へ戻る'}
          </Button>
        </div>
      )}

      {/* 下部固定操作 */}
      <div style={{ marginTop: 32 }}>
        <Button variant="accent" onClick={quitWithSave}>
          中断して戻る
        </Button>

        <Button variant="main" onClick={quitToTop}>
          TOPへ戻る（最初から）
        </Button>
      </div>
    </QuizLayout>
  )
}
