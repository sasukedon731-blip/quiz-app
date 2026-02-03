'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType, Question } from '@/app/data/types'

const STORAGE_PROGRESS_KEY = 'progress'
const STORAGE_WRONG_KEY = 'wrong'

// ✅ ランダムセッション（問題順＋選択肢順）保存キー
const STORAGE_NORMAL_SESSION_KEY = 'normal-session'

type Props = {
  quiz: Quiz
  quizType: QuizType
}

// ✅ Fisher–Yates shuffle（破壊しない）
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ✅ 1問の choices をシャッフルし、correctIndex を更新
function shuffleQuestionChoices(q: Question): Question {
  const choicesWithIndex = q.choices.map((text, idx) => ({ text, idx }))
  const shuffled = shuffleArray(choicesWithIndex)

  const newCorrectIndex = shuffled.findIndex(x => x.idx === q.correctIndex)

  return {
    ...q,
    choices: shuffled.map(x => x.text),
    correctIndex: newCorrectIndex,
  }
}

// ✅ 問題順も choices も両方ランダム化
function buildRandomQuestions(questions: Question[]): Question[] {
  const randomized = questions.map(shuffleQuestionChoices)
  return shuffleArray(randomized)
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

    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + durationMs / 1000 + 0.02)

    osc.onended = () => {
      ctx.close().catch(() => {})
    }
  } catch {
    // 失敗しても落とさない
  }
}

export default function NormalClient({ quiz, quizType }: Props) {
  const router = useRouter()

  // ✅ この回の「ランダム済み問題」
  const [questions, setQuestions] = useState<Question[]>([])

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<Question[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const answeringRef = useRef(false)

  // 🔹 初期化（セッション復元 or 新規作成）
  useEffect(() => {
    try {
      // 1) ランダムセッション復元
      const sessionRaw = localStorage.getItem(`${STORAGE_NORMAL_SESSION_KEY}-${quizType}`)
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw)
        if (Array.isArray(session?.questions) && session.questions.length > 0) {
          setQuestions(session.questions)
        }
      } else {
        // 2) 新規ランダムセッション作成
        const rnd = buildRandomQuestions(quiz.questions)
        setQuestions(rnd)
        localStorage.setItem(
          `${STORAGE_NORMAL_SESSION_KEY}-${quizType}`,
          JSON.stringify({ questions: rnd })
        )
      }

      // 3) 進捗復元
      const saved = localStorage.getItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed?.index === 'number') {
          setIndex(parsed.index)
        }
      }

      // 4) wrong復元
      const savedWrong = localStorage.getItem(`${STORAGE_WRONG_KEY}-${quizType}`)
      if (savedWrong) {
        const parsedWrong = JSON.parse(savedWrong)
        if (Array.isArray(parsedWrong)) {
          setWrong(parsedWrong)
        }
      }
    } catch {
      // 壊れたデータは破棄して新規に
      localStorage.removeItem(`${STORAGE_NORMAL_SESSION_KEY}-${quizType}`)
      localStorage.removeItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
      localStorage.removeItem(`${STORAGE_WRONG_KEY}-${quizType}`)
      const rnd = buildRandomQuestions(quiz.questions)
      setQuestions(rnd)
      localStorage.setItem(
        `${STORAGE_NORMAL_SESSION_KEY}-${quizType}`,
        JSON.stringify({ questions: rnd })
      )
    }
  }, [quizType, quiz.questions])

  if (questions.length === 0) {
    return (
      <QuizLayout title={quiz.title}>
        <p>読み込み中...</p>
      </QuizLayout>
    )
  }

  const current = questions[index]

  const answer = (i: number) => {
    if (selected !== null) return
    if (answeringRef.current) return
    answeringRef.current = true

    setSelected(i)

    const ok = i === current.correctIndex
    setIsCorrect(ok)

    if (ok) {
      playBeep(880, 130, 'sine')
    } else {
      playBeep(220, 180, 'square')
      setWrong(prev => [...prev, current])
    }

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

    if (index + 1 < questions.length) {
      const nextIndex = index + 1
      setIndex(nextIndex)

      localStorage.setItem(
        `${STORAGE_PROGRESS_KEY}-${quizType}`,
        JSON.stringify({ index: nextIndex })
      )
      localStorage.setItem(`${STORAGE_WRONG_KEY}-${quizType}`, JSON.stringify(wrong))
    } else {
      // 全問終了
      localStorage.removeItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
      localStorage.setItem(`${STORAGE_WRONG_KEY}-${quizType}`, JSON.stringify(wrong))
      // ✅ この回が終わったら、次回は新しくランダムにしたいのでセッションを消す
      localStorage.removeItem(`${STORAGE_NORMAL_SESSION_KEY}-${quizType}`)
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
        {index + 1} / {questions.length}
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

      {selected !== null && (
        <div className="mt-4 rounded-lg border p-3">
          <div
            className={`mt-2 rounded-lg px-4 py-2 text-center text-xl font-extrabold ${
              isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {isCorrect ? '⭕ 正解！' : '❌ 不正解'}
          </div>

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
          {index + 1 < questions.length ? '次へ' : 'モード選択に戻る'}
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
