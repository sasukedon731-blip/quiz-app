'use client'

import { useEffect, useRef, useState } from 'react'
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

// ✅ 音素材なしで「ピッ」音を出す（Web Audio API）
function playBeep(freq: number, durationMs: number, type: OscillatorType = 'sine') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioCtx()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.value = freq

    // 耳に痛くならないように音量は控えめ＆フェード
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + durationMs / 1000 + 0.02)

    // 後始末
    osc.onended = () => {
      ctx.close().catch(() => {})
    }
  } catch {
    // Safari等で失敗してもアプリは落とさない
  }
}

export default function NormalClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<Question[]>([])

  // ✅ 「回答結果（正誤）」を明示的に保持（表示にも使う）
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // ✅ 連打や二重再生防止（超軽いガード）
  const answeringRef = useRef(false)

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
      localStorage.removeItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
      localStorage.removeItem(`${STORAGE_WRONG_KEY}-${quizType}`)
    }
  }, [quizType])

  const current = quiz.questions[index]

  const answer = (i: number) => {
    if (selected !== null) return
    if (answeringRef.current) return
    answeringRef.current = true

    setSelected(i)

    const ok = i === current.correctIndex
    setIsCorrect(ok)

    // ✅ 正解音／不正解音（クリック＝ユーザー操作なので再生されやすい）
    if (ok) {
      // 正解：高めに「ピッ」
      playBeep(880, 120, 'sine')
    } else {
      // 不正解：低めに「ブッ」
      playBeep(220, 180, 'square')
    }

    // 間違えた問題を保存
    if (!ok) {
      setWrong(prev => [...prev, current])
    }

    // 次のクリックを許可（同じ問題内はselectedで止まるが念のため）
    setTimeout(() => {
      answeringRef.current = false
    }, 200)
  }

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  const next = () => {
    setSelected(null)
    setIsCorrect(null)

    if (index + 1 < quiz.questions.length) {
      const nextIndex = index + 1
      setIndex(nextIndex)

      // 進捗も随時保存
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
    localStorage.setItem(`${STORAGE_PROGRESS_KEY}-${quizType}`, JSON.stringify({ index }))
    localStorage.setItem(`${STORAGE_WRONG_KEY}-${quizType}`, JSON.stringify(wrong))
    goModeSelect()
  }

  return (
    <QuizLayout title={quiz.title}>
      <p>
        {index + 1} / {quiz.questions.length}
      </p>

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

      {/* ✅ 回答後：正誤（色＋太字）＋正解＋解説 */}
      {selected !== null && (
        <div className="mt-4 rounded-lg border p-3">
          <div
            className={`text-lg font-bold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isCorrect ? '正解！' : '不正解'}
          </div>

          {/* 任意：不正解のときだけ「あなたの回答」を表示するとさらに分かりやすい */}
          {!isCorrect && (
            <div className="mt-2 text-sm text-red-700">
              あなたの回答：{current.choices[selected]}
            </div>
          )}

          <div className="mt-2 text-sm font-semibold text-green-700">
            正解：{current.choices[current.correctIndex]}
          </div>

          {current.explanation && (
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
              {current.explanation}
            </div>
          )}
        </div>
      )}

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
