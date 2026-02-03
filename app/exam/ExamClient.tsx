'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType } from '@/app/data/types'

const EXAM_TIME_SEC = 20 * 60 // 20分（必要なら変更）

type Props = {
  quiz: Quiz
  quizType: QuizType
}

type Answer = {
  selectedIndex: number
  isCorrect: boolean
}

export default function ExamClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const total = quiz.questions.length

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  // 各設問の回答を貯める（解説表示は最後だけ）
  const [answers, setAnswers] = useState<Answer[]>([])

  // タイマー
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SEC)

  // 試験が終了したか（全問 or 時間切れ）
  const [finished, setFinished] = useState(false)

  const current = quiz.questions[index]

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  // タイマー進行
  useEffect(() => {
    if (finished) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          setFinished(true) // 時間切れ → 結果表示へ
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [finished])

  // mm:ss 表示
  const timeLabel = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
    const s = timeLeft % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [timeLeft])

  const answer = (i: number) => {
    if (finished) return
    if (selected !== null) return

    setSelected(i)

    const ok = i === current.correctIndex

    // 回答を保存（順番通りに積む）
    setAnswers(prev => [...prev, { selectedIndex: i, isCorrect: ok }])

    // 模擬試験は“解説を出さずに”次へ進める（少しだけ間を置くと気持ちいい）
    setTimeout(() => {
      setSelected(null)

      if (index + 1 < total) {
        setIndex(v => v + 1)
      } else {
        setFinished(true) // 全問終了 → 結果表示へ
      }
    }, 250)
  }

  // 結果計算
  const correctCount = useMemo(() => {
    return answers.filter(a => a.isCorrect).length
  }, [answers])

  // finished=true の結果画面
  if (finished) {
    return (
      <QuizLayout title={`${quiz.title}（模擬試験 結果）`}>
        <div className="mb-4 rounded-lg border p-3">
          <div className="text-lg font-bold">
            結果：{correctCount} / {answers.length} 問正解
          </div>
          <div className="mt-1 text-sm">
            残り時間：{timeLabel}（時間切れの場合は 00:00）
          </div>
        </div>

        {/* ✅ 全問分：正誤＋解説（まとめて表示） */}
        <div className="space-y-4">
          {quiz.questions.slice(0, answers.length).map((q, idx) => {
            const a = answers[idx]
            const ok = a?.isCorrect

            return (
              <div key={idx} className="rounded-lg border p-3">
                <div className="text-sm">
                  {idx + 1} / {total}
                </div>

                <div className="mt-1 font-semibold">{q.question}</div>

                <div
                  className={`mt-2 text-lg font-bold ${
                    ok ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {ok ? '正解！' : '不正解'}
                </div>

                {!ok && a && (
                  <div className="mt-2 text-sm text-red-700">
                    あなたの回答：{q.choices[a.selectedIndex]}
                  </div>
                )}

                <div className="mt-2 text-sm font-semibold text-green-700">
                  正解：{q.choices[q.correctIndex]}
                </div>

                {q.explanation && (
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                    {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6">
          <Button variant="main" onClick={goModeSelect}>
            モード選択に戻る
          </Button>
        </div>
      </QuizLayout>
    )
  }

  // 試験中画面（解説は出さない）
  return (
    <QuizLayout title={`${quiz.title}（模擬試験）`}>
      <div className="flex items-center justify-between">
        <p>
          {index + 1} / {total}
        </p>
        <p className="font-bold">{timeLabel}</p>
      </div>

      <h2>{current.question}</h2>

      {current.choices.map((c, i) => (
        <Button
          key={i}
          variant="choice"
          onClick={() => answer(i)}
          disabled={selected !== null}
          // 試験中は正誤の色も出さない（出すと答えがバレるため）
        >
          {c}
        </Button>
      ))}

      <div className="mt-4">
        <Button variant="accent" onClick={goModeSelect}>
          モード選択に戻る
        </Button>
      </div>
    </QuizLayout>
  )
}
