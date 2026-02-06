"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import QuizLayout from "@/app/components/QuizLayout"
import Button from "@/app/components/Button"
import type { Question, QuizType } from "@/app/data/types"

const STORAGE_WRONG_KEY = "wrong"

type Props = {
  quizType: QuizType
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
    try {
      const key = `${STORAGE_WRONG_KEY}-${quizType}`
      const saved = localStorage.getItem(key)

      if (!saved) {
        setQuestions([])
        setIndex(0)
        setSelected(null)
        return
      }

      const data = JSON.parse(saved)

      if (Array.isArray(data)) {
        setQuestions(data as Question[])
      } else {
        setQuestions([])
      }

      // ✅ 読み込み時は状態を初期化（前回の選択が残らない）
      setIndex(0)
      setSelected(null)
    } catch {
      // 壊れていたら消して落ちないようにする
      localStorage.removeItem(`${STORAGE_WRONG_KEY}-${quizType}`)
      setQuestions([])
      setIndex(0)
      setSelected(null)
    }
  }, [quizType])

  // 復習対象なし
  if (!questions || questions.length === 0) {
    return (
      <QuizLayout title="復習モード">
        <p>復習する問題はありません</p>

        {/* ✅ 戻るボタンはここだけ */}
        <Button variant="accent" onClick={goModeSelect}>
          モード選択に戻る
        </Button>
      </QuizLayout>
    )
  }

  const current = questions[index]
  const isLast = index >= questions.length - 1
  const answered = selected !== null

  const answer = (i: number) => {
    if (answered) return
    setSelected(i)
  }

  const next = () => {
    // ✅ 次へ：状態を確実にリセット
    setSelected(null)

    if (!isLast) {
      setIndex((prev) => prev + 1)
      return
    }

    // ✅ 最後は終了（モード選択へ）
    goModeSelect()
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

      {/* ✅ 回答後だけ表示：解説 + 次へ/終了（ここに集約） */}
      {answered && (
        <div className="mt-4">
          <p>{selected === current.correctIndex ? "⭕ 正解！" : "❌ 不正解"}</p>
          {current.explanation && <p className="mt-2">{current.explanation}</p>}

          <Button variant="main" onClick={next}>
            {!isLast ? "次へ" : "終了（モード選択へ）"}
          </Button>
        </div>
      )}

      {/* ✅ 戻るボタンは常時出さない（2つになる原因）
          どうしても常時出したい場合は「未回答の時だけ」にする
      */}
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
