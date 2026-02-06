'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Question, QuizType } from '@/app/data/types'

const STORAGE_WRONG_KEY = 'wrong'

type Props = {
  quizType: QuizType
}

function isQuestionLike(v: any): v is Question {
  return (
    v &&
    typeof v === 'object' &&
    typeof v.id === 'number' &&
    typeof v.question === 'string' &&
    Array.isArray(v.choices) &&
    typeof v.correctIndex === 'number'
  )
}

export default function ReviewClient({ quizType }: Props) {
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  useEffect(() => {
    const key = `${STORAGE_WRONG_KEY}-${quizType}`

    try {
      const saved = localStorage.getItem(key)
      if (!saved) {
        setQuestions([])
        setIndex(0)
        setSelected(null)
        return
      }

      const data = JSON.parse(saved)

      if (Array.isArray(data)) {
        const list = data.filter(isQuestionLike) as Question[]
        // ✅ 念のため重複除去（idで一意にする）
        const uniq = Array.from(new Map(list.map(q => [q.id, q])).values())

        setQuestions(uniq)
        setIndex(0)
        setSelected(null)
        return
      }

      setQuestions([])
      setIndex(0)
      setSelected(null)
    } catch {
      localStorage.removeItem(key)
      setQuestions([])
      setIndex(0)
      setSelected(null)
    }
  }, [quizType])

  const current = questions[index]

  const answered = selected !== null
  const isLast = index >= questions.length - 1

  const resultLabel = useMemo(() => {
    if (!answered || !current) return ''
    return selected === current.correctIndex ? '⭕ 正解！' : '❌ 不正解'
  }, [answered, selected, current])

  if (!questions || questions.length === 0) {
    return (
      <QuizLayout title="復習モード">
        <p>復習する問題はありません</p>
        <Button variant="accent" onClick={goModeSelect}>
          モード選択に戻る
        </Button>
      </QuizLayout>
    )
  }

  if (!current) {
    return (
      <QuizLayout title="復習モード">
        <p>問題の読み込みに失敗しました</p>
        <Button variant="accent" onClick={goModeSelect}>
          モード選択に戻る
        </Button>
      </QuizLayout>
    )
  }

  const answer = (i: number) => {
    if (answered) return
    setSelected(i)
  }

  const next = () => {
    setSelected(null)
    if (!isLast) setIndex(prev => prev + 1)
    else goModeSelect()
  }

  return (
    <QuizLayout title="復習モード">
      <p>
        {index + 1} / {questions.length}
      </p>

      <h2>{current.question}</h2>

      {current.choices.map((c, i) => (
        <Button
          key={i}
          variant="choice"
          onClick={() => answer(i)}
          disabled={answered}
          isCorrect={answered && i === current.correctIndex}
          isWrong={answered && i === selected && i !== current.correctIndex}
        >
          {c}
        </Button>
      ))}

      {answered && (
        <div className="mt-4">
          <p>{resultLabel}</p>
          {current.explanation && <p className="mt-2 whitespace-pre-wrap">{current.explanation}</p>}

          <Button variant="main" onClick={next}>
            {isLast ? '終了（モード選択へ）' : '次へ'}
          </Button>
        </div>
      )}

      {!answered && (
        <div className="mt-4">
          <Button variant="accent" onClick={goModeSelect}>
            モード選択に戻る
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
