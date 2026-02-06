"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import QuizLayout from "@/app/components/QuizLayout"
import Button from "@/app/components/Button"
import { quizzes } from "@/app/data/quizzes"
import type { Question, QuizType } from "@/app/data/types"

const STORAGE_BASE = "wrong"

type Props = { quizType: QuizType }

function isQuestionLike(v: any): v is Question {
  return v && typeof v === "object" && typeof v.question === "string" && Array.isArray(v.choices)
}

export default function ReviewClient({ quizType }: Props) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const goModeSelect = () => router.push(`/select-mode?type=${quizType}`)

  useEffect(() => {
    const key = `${STORAGE_BASE}-${quizType}`

    // 旧キー互換（念のため）
    const legacyKeys = [
      key,
      "wrongQuestions", // 以前の実装でありがち
      `wrongQuestions-${quizType}`,
    ]

    let raw: string | null = null
    for (const k of legacyKeys) {
      const v = localStorage.getItem(k)
      if (v) {
        raw = v
        break
      }
    }

    if (!raw) {
      setQuestions([])
      setIndex(0)
      setSelected(null)
      return
    }

    try {
      const data = JSON.parse(raw)

      // ✅ 1) すでに Question[] を保存している形式（現状互換）
      if (Array.isArray(data) && data.length > 0 && isQuestionLike(data[0])) {
        setQuestions(data as Question[])
        setIndex(0)
        setSelected(null)
        return
      }

      // ✅ 2) ID配列形式（推奨）
      if (Array.isArray(data) && data.every((x) => typeof x === "number")) {
        const all = quizzes[quizType].questions as Question[]
        const review = all.filter((q: any) => data.includes(q.id))
        setQuestions(review)
        setIndex(0)
        setSelected(null)
        return
      }

      // それ以外は不正
      setQuestions([])
      setIndex(0)
      setSelected(null)
    } catch {
      setQuestions([])
      setIndex(0)
      setSelected(null)
    }
  }, [quizType])

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

  const resultLabel = useMemo(() => {
    if (!answered) return ""
    return selected === current.correctIndex ? "⭕ 正解！" : "❌ 不正解"
  }, [answered, selected, current])

  const answer = (i: number) => {
    if (answered) return
    setSelected(i)
  }

  const next = () => {
    setSelected(null)
    if (!isLast) setIndex((p) => p + 1)
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
