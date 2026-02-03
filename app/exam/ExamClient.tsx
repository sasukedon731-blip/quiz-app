'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType, Question } from '@/app/data/types'

const EXAM_SECONDS = 20 * 60

type Props = {
  quiz: Quiz
  quizType: QuizType
}

export default function ExamClient({ quiz, quizType }: Props) {
  const router = useRouter()

  // ✅ 既存キーに合わせる（Normalと揃えるなら後で統一してOK）
  const wrongKey = `wrong-${quizType}`
  const examProgressKey = `exam-progress-${quizType}`

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState<Question[]>([])
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS)
  const [finished, setFinished] = useState(false)

  // ✅ 「モード選択に戻る」を一箇所にまとめる
  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  // ✅ 中断復帰（模擬）
  useEffect(() => {
    try {
      const saved = localStorage.getItem(examProgressKey)
      if (!saved) return

      const data = JSON.parse(saved) as {
        index: unknown
        score: unknown
        secondsLeft: unknown
        wrong: unknown
      }

      if (typeof data.index === 'number') setIndex(data.index)
      if (typeof data.score === 'number') setScore(data.score)
      if (typeof data.secondsLeft === 'number') setSecondsLeft(data.secondsLeft)
      if (Array.isArray(data.wrong)) setWrong(data.wrong as Question[])
    } catch {
      // 壊れていたら削除して落ちないようにする
      localStorage.removeItem(examProgressKey)
      localStorage.removeItem(wrongKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ✅ タイマー
  useEffect(() => {
    if (finished) return

    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(t)
          setFinished(true)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(t)
  }, [finished])

  const current = quiz.questions[index]

  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }, [secondsLeft])

  const answer = (i: number) => {
    if (selected !== null || finished) return

    setSelected(i)

    if (i === current.correctIndex) {
      setScore(v => v + 1)
    } else {
      setWrong(list => [...list, current])
    }
  }

  const next = () => {
    if (finished) return

    setSelected(null)

    if (index + 1 < quiz.questions.length) {
      const nextIndex = index + 1
      setIndex(nextIndex)

      // ✅ 進捗も随時保存（万一のリロードに強く）
      localStorage.setItem(
        examProgressKey,
        JSON.stringify({ index: nextIndex, score, secondsLeft, wrong })
      )
      localStorage.setItem(wrongKey, JSON.stringify(wrong))
    } else {
      setFinished(true)
    }
  }

  const saveAndExit = () => {
    // ✅ 中断保存してモード選択へ戻る
    localStorage.setItem(
      examProgressKey,
      JSON.stringify({ index, score, secondsLeft, wrong })
    )
    localStorage.setItem(wrongKey, JSON.stringify(wrong))
    goModeSelect()
  }

  const finish = () => {
    // ✅ 終了 → 結果へ（ページ内で表示される）
    localStorage.removeItem(examProgressKey)
    localStorage.setItem(wrongKey, JSON.stringify(wrong))
    setFinished(true)
  }

  if (finished) {
    return (
      <QuizLayout title={`${quiz.title}（模擬試験 結果）`}>
        <p className="mb-2">スコア：{score} / {quiz.questions.length}</p>
        <p className="mb-4">残り時間：{mmss}</p>

        <Button variant="main" onClick={() => router.push(`/review?type=${quizType}`)}>
          間違えた問題を復習する
        </Button>

        <Button variant="accent" onClick={goModeSelect}>
          モード選択に戻る
        </Button>
      </QuizLayout>
    )
  }

  return (
    <QuizLayout title={`${quiz.title}（模擬試験）`}>
      <p className="mb-2">残り時間：{mmss}</p>

      <p className="mb-2">
        {index + 1} / {quiz.questions.length}
      </p>

      <h2 className="mb-4">{current.question}</h2>

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
        <div className="mt-4">
          <p className="mb-2">
            {selected === current.correctIndex ? '⭕ 正解！' : '❌ 不正解'}
          </p>

          {current.explanation && (
            <p className="mb-4">{current.explanation}</p>
          )}

          <Button variant="main" onClick={next}>
            {index + 1 < quiz.questions.length ? '次へ' : '結果を見る'}
          </Button>
        </div>
      )}

      <div className="mt-6" style={{ display: 'grid', gap: 12 }}>
        <Button variant="accent" onClick={saveAndExit}>
          中断してモード選択へ
        </Button>

        <Button variant="success" onClick={finish}>
          ここで終了して結果へ
        </Button>
      </div>
    </QuizLayout>
  )
}
