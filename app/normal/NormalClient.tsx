'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType, Question } from '@/app/data/types'

const STORAGE_PROGRESS_KEY = 'progress'
const STORAGE_WRONG_KEY = 'wrong'
const STORAGE_NORMAL_SESSION_KEY = 'normal-session'
const STORAGE_STUDY_PROGRESS_PREFIX = 'study-progress'

type Props = {
  quiz: Quiz
  quizType: QuizType
}

type StudyProgress = {
  totalSessions: number
  todaySessions: number
  lastStudyDate: string
  streak: number
  streakUpdatedDate: string
  bestStreak: number
}

// ---------- util ----------
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleQuestionChoices(q: Question): Question {
  const choicesWithIndex = q.choices.map((text, idx) => ({ text, idx }))
  const shuffled = shuffleArray(choicesWithIndex)
  const newCorrectIndex = shuffled.findIndex(x => x.idx === q.correctIndex)
  return { ...q, choices: shuffled.map(x => x.text), correctIndex: newCorrectIndex }
}

function buildRandomQuestions(questions: Question[]): Question[] {
  return shuffleArray(questions.map(shuffleQuestionChoices))
}

function todayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function addDays(ymd: string, delta: number) {
  const d = new Date(`${ymd}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

// 音（素材不要）
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
    osc.onended = () => ctx.close().catch(() => {})
  } catch {}
}

function readProgress(quizType: QuizType): StudyProgress {
  const key = `${STORAGE_STUDY_PROGRESS_PREFIX}-${quizType}`
  const today = todayKey()
  const base: StudyProgress = {
    totalSessions: 0,
    todaySessions: 0,
    lastStudyDate: today,
    streak: 0,
    streakUpdatedDate: '',
    bestStreak: 0,
  }

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return base
    const d = JSON.parse(raw) as Partial<StudyProgress>
    return {
      totalSessions: typeof d.totalSessions === 'number' ? d.totalSessions : 0,
      todaySessions: typeof d.todaySessions === 'number' ? d.todaySessions : 0,
      lastStudyDate: typeof d.lastStudyDate === 'string' ? d.lastStudyDate : today,
      streak: typeof d.streak === 'number' ? d.streak : 0,
      streakUpdatedDate: typeof d.streakUpdatedDate === 'string' ? d.streakUpdatedDate : '',
      bestStreak: typeof d.bestStreak === 'number' ? d.bestStreak : 0,
    }
  } catch {
    return base
  }
}

function writeProgress(quizType: QuizType, p: StudyProgress) {
  const key = `${STORAGE_STUDY_PROGRESS_PREFIX}-${quizType}`
  localStorage.setItem(key, JSON.stringify(p))
}

/**
 * ✅ 全問完了した時だけ呼ぶ
 * - todaySessions / totalSessions を +1
 * - streak を更新（同日2回目は増やさない）
 */
function incrementOnComplete(quizType: QuizType) {
  const today = todayKey()
  const p = readProgress(quizType)

  // 日付が変わってたら todaySessions をリセット
  if (p.lastStudyDate !== today) {
    p.todaySessions = 0
    p.lastStudyDate = today
  }

  p.totalSessions += 1
  p.todaySessions += 1

  // streak は「その日初めて完了した時だけ」更新
  if (p.streakUpdatedDate !== today) {
    const yesterday = addDays(today, -1)

    if (p.streakUpdatedDate === yesterday) {
      // 昨日も学習完了してた → 連続
      p.streak = (p.streak || 0) + 1
    } else {
      // 途切れた or 初回
      p.streak = 1
    }
    p.streakUpdatedDate = today
    p.bestStreak = Math.max(p.bestStreak || 0, p.streak)
  }

  writeProgress(quizType, p)
}
// --------------------------------

export default function NormalClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<Question[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const answeringRef = useRef(false)
  const countedRef = useRef(false)

  useEffect(() => {
    try {
      const sessionRaw = localStorage.getItem(`${STORAGE_NORMAL_SESSION_KEY}-${quizType}`)
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw)
        if (Array.isArray(session?.questions)) setQuestions(session.questions)
      } else {
        const rnd = buildRandomQuestions(quiz.questions)
        setQuestions(rnd)
        localStorage.setItem(
          `${STORAGE_NORMAL_SESSION_KEY}-${quizType}`,
          JSON.stringify({ questions: rnd })
        )
      }

      const saved = localStorage.getItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed?.index === 'number') setIndex(parsed.index)
      }

      const savedWrong = localStorage.getItem(`${STORAGE_WRONG_KEY}-${quizType}`)
      if (savedWrong) {
        const parsedWrong = JSON.parse(savedWrong)
        if (Array.isArray(parsedWrong)) setWrong(parsedWrong)
      }
    } catch {
      localStorage.removeItem(`${STORAGE_NORMAL_SESSION_KEY}-${quizType}`)
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

    if (ok) playBeep(880, 120, 'sine')
    else {
      playBeep(220, 160, 'square')
      setWrong(prev => [...prev, current])
    }

    setTimeout(() => {
      answeringRef.current = false
    }, 150)
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
      localStorage.setItem(`${STORAGE_PROGRESS_KEY}-${quizType}`, JSON.stringify({ index: nextIndex }))
      localStorage.setItem(`${STORAGE_WRONG_KEY}-${quizType}`, JSON.stringify(wrong))
      return
    }

    // ✅ 全問終了 → 学習回数 +1 & streak更新（1回だけ）
    if (!countedRef.current) {
      countedRef.current = true
      incrementOnComplete(quizType)
      playBeep(1046, 160, 'triangle') // 🎉っぽい音
    }

    // 終了処理
    localStorage.removeItem(`${STORAGE_PROGRESS_KEY}-${quizType}`)
    localStorage.setItem(`${STORAGE_WRONG_KEY}-${quizType}`, JSON.stringify(wrong))
    localStorage.removeItem(`${STORAGE_NORMAL_SESSION_KEY}-${quizType}`)

    goModeSelect()
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
            className={`rounded-lg px-4 py-2 text-center text-xl font-extrabold ${
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
          {index + 1 < questions.length ? '次へ' : '🎉 完了してモード選択へ'}
        </Button>
      )}

      <div className="mt-4">
        <Button variant="accent" onClick={interrupt}>
          中断してモード選択へ
        </Button>
      </div>
    </QuizLayout>
  )
}
