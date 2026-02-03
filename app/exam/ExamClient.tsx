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
  const [locked, setLocked] = useState(false) // 連打防止
  const [answers, setAnswers] = useState<Answer[]>([])

  // タイマー
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SEC)

  // 終了フラグ
  const [finished, setFinished] = useState(false)

  const current = quiz.questions[index]

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  // 中断（※正誤は見せない）
  const interrupt = () => {
    goModeSelect()
  }

  // タイマー進行（試験中だけ）
  useEffect(() => {
    if (finished) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          setFinished(true) // 時間切れ → 結果へ
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [finished])

  // mm:ss
  const timeLabel = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
    const s = timeLeft % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [timeLeft])

  const answer = (i: number) => {
    if (finished) return
    if (locked) return
    setLocked(true)

    const ok = i === current.correctIndex

    // 回答を保存（順番どおり）
    setAnswers(prev => [...prev, { selectedIndex: i, isCorrect: ok }])

    // ✅ ここが重要：試験中は正誤表示なしで次へ進む
    setTimeout(() => {
      if (index + 1 < total) {
        setIndex(v => v + 1)
        setLocked(false)
      } else {
        setFinished(true) // 全問終了 → 結果へ
      }
    }, 200)
  }

  const correctCount = useMemo(() => {
    return answers.filter(a => a.isCorrect).length
  }, [answers])

  // ✅ 結果画面（最後にまとめて正誤＆解説）
  if (finished) {
    return (
      <QuizLayout title={`${quiz.title}（模擬試験 結果）`}>
        <div className="mb-4 rounded-lg border p-3">
          <div className="text-lg font-bold">
            結果：{correctCount} / {answers.length} 問正解
          </div>
          <div className="mt-1 text-sm">残り時間：{timeLabel}</div>
        </div>

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

  // ✅ 試験中画面（絶対に正答を見せない）
  return (
    <QuizLayout title={`${quiz.title}（模擬試験）`}>
      <div className="flex items-center justify-between">
        <p>
          {index + 1} / {total}
        </p>
        <p className="font-bold">{timeLabel}</p>
      </div>

      <h2>{current.question}</h2>

      {/* ✅ 重要：isCorrect / isWrong を渡さない（正答が見えなくなる） */}
      {current.choices.map((c, i) => (
        <Button
          key={i}
          variant="choice"
          onClick={() => answer(i)}
          disabled={locked}
        >
          {c}
        </Button>
      ))}

      <div className="mt-4">
        <Button variant="accent" onClick={interrupt}>
          中断してモード選択へ
        </Button>
      </div>
    </QuizLayout>
  )
}
