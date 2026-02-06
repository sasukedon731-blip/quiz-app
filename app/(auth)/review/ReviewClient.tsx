"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import QuizLayout from "@/app/components/QuizLayout"
import Button from "@/app/components/Button"
import { quizzes } from "@/app/data/quizzes"
import type { Question, QuizType } from "@/app/data/types"

const STORAGE_KEY = "wrong"

type Props = {
  quizType: QuizType
}

export default function ReviewClient({ quizType }: Props) {
  const router = useRouter()

  // ✅ Hooks は必ず最上位・固定順
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  // ✅ 復習問題の読み込み（ID配列方式）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}-${quizType}`)
      if (!raw) {
        setQuestions([])
        return
      }

      const ids = JSON.parse(raw)
      if (!Array.isArray(ids)) {
        setQuestions([])
        return
      }

      const all = quizzes[quizType]?.questions
      if (!Array.isArray(all)) {
        setQuestions([])
        return
      }

      const review = all.filter(q => ids.includes(q.id))
      setQuestions(review)
      setIndex(0)
      setSelected(null)
    } catch {
      setQuestions([])
      setIndex(0)
      setSelected(null)
    }
  }, [quizType])

  // ---------- 表示分岐（Hooksの後） ----------

  if (questions.length === 0) {
    return (
      <QuizLayout title="復習モード">
        <p>復習する問題はありません</p>
        <Button variant="accent" onClick={goModeSelect}>
          モード選択に戻る
        </Button>
      </QuizLayout>
    )
  }

  const current = questions[index]
  const answered = selected !== null
  const isLast = index === questions.length - 1

  const answer = (i: number) => {
    if (answered) return
    setSelected(i)
  }

  const next = () => {
    setSelected(null)
    if (!isLast) {
      setIndex(prev => prev + 1)
    } else {
      goModeSelect()
    }
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
          <p>{selected === current.correctIndex ? "⭕ 正解！" : "❌ 不正解"}</p>
          {current.explanation && <p className="mt-2">{current.explanation}</p>}

          <Button variant="main" onClick={next}>
            {isLast ? "終了（モード選択へ）" : "次へ"}
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
