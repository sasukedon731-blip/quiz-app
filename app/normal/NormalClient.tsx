'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType, Question } from '@/app/data/types'

const STORAGE_PROGRESS_KEY = 'progress'
const STORAGE_WRONG_KEY = 'wrong'

type Props = {
  quiz: Quiz
  quizType: QuizType
}

export default function NormalClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<Question[]>([])

  // 🔹 中断復帰
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed?.index === 'number') {
          setIndex(parsed.index)
        }
      }

      const savedWrong = localStorage.getItem(`${STORAGE_WRONG_KEY}-${quizType}`)
      if (savedWrong) {
        const parsedWrong = JSON.parse(savedWrong)
        if (Array.isArray(parsedWrong)) {
          setWrong(parsedWrong)
        }
      }
    } catch {
      // 壊れたデータがあっても落とさない
      localStorage.removeItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
      localStorage.removeItem(`${STORAGE_WRONG_KEY}-${quizType}`)
    }
  }, [quizType])

  const current = quiz.questions[index]

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)

    // 間違えた問題を保存
    if (i !== current.correctIndex) {
      setWrong(prev => [...prev, current])
    }
  }

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  const next = () => {
    setSelected(null)

    if (index + 1 < quiz.questions.length) {
      const nextIndex = index + 1
      setIndex(nextIndex)

      // 進捗も随時保存（万一のリロードに強く）
      localStorage.setItem(
        `${STORAGE_PROGRESS_KEY}-${quizType}`,
        JSON.stringify({ index: nextIndex })
      )
      localStorage.setItem(
        `${STORAGE_WRONG_KEY}-${quizType}`,
        JSON.stringify(wrong)
      )
    } else {
      // 全問終了
      localStorage.removeItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
      localStorage.setItem(`${STORAGE_WRONG_KEY}-${quizType}`, JSON.stringify(wrong))
      goModeSelect()
    }
  }

  const interrupt = () => {
    // 中断保存
    localStorage.setItem(`${STORAGE_PROGRESS_KEY}-${quizType}`, JSON.stringify({ index }))
    localStorage.setItem(`${STORAGE_WRONG_KEY}-${quizType}`, JSON.stringify(wrong))
    goModeSelect()
  }

  return (
    <QuizLayout title={quiz.title}>
      <p>{index + 1} / {quiz.questions.length}</p>

      <h2>{current.question}</h2>

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
          {index + 1 < quiz.questions.length ? '次へ' : 'モード選択に戻る'}
        </Button>
      )}

      <div className="mt-4">
        <Button variant="accent" onClick={interrupt}>
          中断してモード選択へ
        </Button>

        <Button variant="accent" onClick={goModeSelect}>
          モード選択に戻る
        </Button>
      </div>
    </QuizLayout>
  )
}
