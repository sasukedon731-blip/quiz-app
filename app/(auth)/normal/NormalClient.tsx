'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import ListeningControls from '@/app/components/ListeningControls'
import type { Quiz, QuizType, Question } from '@/app/data/types'

import { useAuth } from '@/app/lib/useAuth'
import { db } from '@/app/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

// ✅ 離脱/中断で読み上げ停止
import { stopSpeak } from '@/app/lib/tts'

const STORAGE_PROGRESS_KEY = 'progress'
const STORAGE_WRONG_KEY = 'wrong'
const STORAGE_NORMAL_SESSION_KEY = 'normal-session'
const STORAGE_STUDY_PROGRESS_PREFIX = 'study-progress'

// ★ streak 永続キー
const STREAK_PREFIX = 'normal-streak'

type Props = {
  quiz: Quiz
}

type StudyProgress = {
  totalSessions: number
  todaySessions: number
  lastStudyDate: string
  streak: number
  streakUpdatedDate: string
  bestStreak: number
}

// ---------- utils ----------
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
  return new Date().toISOString().slice(0, 10)
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
 */
function updateProgressOnSessionComplete(quizType: QuizType) {
  const today = todayKey()
  const p = readProgress(quizType)

  const isSameDay = p.lastStudyDate === today
  const nextTodaySessions = isSameDay ? p.todaySessions + 1 : 1

  const shouldUpdateStreak = p.streakUpdatedDate !== today

  let nextStreak = p.streak
  if (shouldUpdateStreak) {
    if (p.lastStudyDate === addDays(today, -1)) nextStreak = p.streak + 1
    else if (p.lastStudyDate === today) nextStreak = p.streak
    else nextStreak = 1
  }

  const nextBest = Math.max(p.bestStreak, nextStreak)

  const next: StudyProgress = {
    totalSessions: p.totalSessions + 1,
    todaySessions: nextTodaySessions,
    lastStudyDate: today,
    streak: nextStreak,
    streakUpdatedDate: shouldUpdateStreak ? today : p.streakUpdatedDate,
    bestStreak: nextBest,
  }

  writeProgress(quizType, next)
  return next
}

export default function NormalClient({ quiz }: Props) {
  const router = useRouter()
  const { user } = useAuth()

  // 唯一の真実
  const quizType: QuizType = quiz.id

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)

  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [correct, setCorrect] = useState(false)

  // ★ streak（連続正解）＋節目演出
  const [streak, setStreak] = useState(0)
  const [streakPop, setStreakPop] = useState(false)
  const [streakFx, setStreakFx] = useState<'none' | 'spark' | 'party'>('none')

  // null: 確認表示 / 'continue' | 'restart'
  const [startChoice, setStartChoice] = useState<'continue' | 'restart' | null>('restart')

  const wrongKey = `${STORAGE_WRONG_KEY}-${quizType}`
  const wrongRef = useRef<Question[]>([])

  const progressKey = `${STORAGE_PROGRESS_KEY}-${quizType}`
  const sessionKey = `${STORAGE_NORMAL_SESSION_KEY}-${quizType}`
  const streakKey = `${STREAK_PREFIX}-${quizType}`

  useEffect(() => {
    indexRef.current = index
  }, [index])

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  const loadStreak = () => {
    const raw = localStorage.getItem(streakKey)
    const n = raw ? Number(raw) : 0
    setStreak(Number.isFinite(n) ? n : 0)
  }

  const saveStreak = (n: number) => {
    setStreak(n)
    localStorage.setItem(streakKey, String(n))
  }

  const startSession = (mode: 'continue' | 'restart') => {
    setStreakFx('none')
    setStreakPop(false)

    if (mode === 'restart') {
      saveStreak(0)
    } else {
      loadStreak()
    }

    const savedWrongRaw = localStorage.getItem(wrongKey)
    if (savedWrongRaw) {
      try {
        wrongRef.current = JSON.parse(savedWrongRaw) as Question[]
      } catch {
        wrongRef.current = []
      }
    } else {
      wrongRef.current = []
    }

    if (mode === 'restart') {
      const built = buildRandomQuestions(quiz.questions)
      setQuestions(built)
      setIndex(0)
      setSelected(null)
      setShowExplanation(false)
      setCorrect(false)

      localStorage.setItem(sessionKey, JSON.stringify({ questions: built }))
      localStorage.removeItem(progressKey)
      return
    }

    let loadedQuestions: Question[] | null = null
    const savedSessionRaw = localStorage.getItem(sessionKey)
    if (savedSessionRaw) {
      try {
        const d = JSON.parse(savedSessionRaw) as { questions: Question[] }
        if (Array.isArray(d.questions) && d.questions.length > 0) loadedQuestions = d.questions
      } catch {}
    }

    if (!loadedQuestions) {
      const built = buildRandomQuestions(quiz.questions)
      setQuestions(built)
      setIndex(0)
      localStorage.setItem(sessionKey, JSON.stringify({ questions: built }))
      localStorage.removeItem(progressKey)
      return
    }

    let resumeIndex = 0
    const savedProgressRaw = localStorage.getItem(progressKey)
    if (savedProgressRaw) {
      try {
        const d = JSON.parse(savedProgressRaw) as { index?: number }
        if (typeof d.index === 'number') resumeIndex = d.index
      } catch {}
    }

    if (resumeIndex < 0 || resumeIndex >= loadedQuestions.length) {
      resumeIndex = 0
      localStorage.removeItem(progressKey)
    }

    setQuestions(loadedQuestions)
    setIndex(resumeIndex)
    setSelected(null)
    setShowExplanation(false)
    setCorrect(false)
  }

  // 初期化
  useEffect(() => {
    stopSpeak()

    const savedWrongRaw = localStorage.getItem(wrongKey)
    if (savedWrongRaw) {
      try {
        wrongRef.current = JSON.parse(savedWrongRaw) as Question[]
      } catch {
        wrongRef.current = []
      }
    } else {
      wrongRef.current = []
    }

    const savedProgressRaw = localStorage.getItem(progressKey)
    if (savedProgressRaw) {
      try {
        const d = JSON.parse(savedProgressRaw) as { index?: number }
        if (typeof d.index === 'number' && d.index > 0) {
          setStartChoice(null)
          return
        }
      } catch {}
    }

    setStartChoice('restart')
    startSession('restart')

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizType])

  // 離脱保存
  useEffect(() => {
    const handler = () => {
      try {
        if (questions.length > 0) {
          localStorage.setItem(progressKey, JSON.stringify({ index: indexRef.current }))
          localStorage.setItem(wrongKey, JSON.stringify(wrongRef.current))
          localStorage.setItem(streakKey, String(streak))
        }
      } catch {}
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [questions.length, progressKey, wrongKey, streak, streakKey])

  if (startChoice === null) {
    return (
      <QuizLayout title={quiz.title}>
        <h2 style={{ marginTop: 0 }}>前回の続きがあります</h2>
        <p style={{ opacity: 0.85 }}>どちらから始めますか？</p>

        <div className="actions">
          <Button
            variant="main"
            onClick={() => {
              setStartChoice('continue')
              startSession('continue')
            }}
          >
            続きから
          </Button>

          <Button
            variant="accent"
            onClick={() => {
              setStartChoice('restart')
              startSession('restart')
            }}
          >
            はじめから
          </Button>
        </div>

        <p className="note">※「はじめから」を選ぶと問題は新しくシャッフルされます</p>

        <div className="actions">
          <Button variant="success" onClick={goModeSelect}>
            いったん戻る
          </Button>
        </div>
      </QuizLayout>
    )
  }

  if (!questions.length) return null

  const current = questions[index]

  const answer = (choiceIndex: number) => {
    if (selected !== null) return
    setSelected(choiceIndex)

    const isCorrect = choiceIndex === current.correctIndex
    setCorrect(isCorrect)
    setShowExplanation(true)

    if (isCorrect) {
      playBeep(880, 120, 'triangle')
      const next = streak + 1
      saveStreak(next)
      setStreakPop(true)
      window.setTimeout(() => setStreakPop(false), 220)

      if (next === 5) setStreakFx('spark')
      else if (next === 10) setStreakFx('party')
      else setStreakFx('none')
    } else {
      playBeep(220, 180, 'sawtooth')
      saveStreak(0)
      setStreakFx('none')
    }

    if (!isCorrect) {
      const exists = wrongRef.current.some(q => q.id === current.id)
      if (!exists) {
        wrongRef.current = [...wrongRef.current, current]
        localStorage.setItem(wrongKey, JSON.stringify(wrongRef.current))
      }
    }
  }

  const next = async () => {
    setSelected(null)
    setShowExplanation(false)

    if (index + 1 >= questions.length) {
      const p = updateProgressOnSessionComplete(quizType)

      if (user) {
        const ref = doc(db, 'users', user.uid, 'progress', quizType)
        await setDoc(
          ref,
          {
            totalSessions: p.totalSessions,
            todaySessions: p.todaySessions,
            streak: p.streak,
            bestStreak: p.bestStreak,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      }

      localStorage.removeItem(progressKey)
      localStorage.removeItem(sessionKey)
      localStorage.removeItem(streakKey) // ★ 完了時は streak を閉じる
      goModeSelect()
      return
    }

    const nextIndex = index + 1
    setIndex(nextIndex)
    localStorage.setItem(progressKey, JSON.stringify({ index: nextIndex }))
  }

  const interrupt = () => {
    stopSpeak()
    localStorage.setItem(progressKey, JSON.stringify({ index }))
    localStorage.setItem(wrongKey, JSON.stringify(wrongRef.current))
    localStorage.setItem(streakKey, String(streak))
    goModeSelect()
  }

  return (
    <QuizLayout title={quiz.title}>
      <div className="kicker">
        <span className="badge">通常</span>
        <span>
          {index + 1} / {questions.length}
        </span>

        {streak >= 2 && (
          <span
            className={[
              'streakPill',
              streakPop ? 'streakPop' : '',
              streakFx === 'spark' ? 'streakSpark' : '',
              streakFx === 'party' ? 'streakParty' : '',
            ].join(' ')}
          >
            🔥 {streak}連続正解
          </span>
        )}
      </div>

      <h2 className="question">{current.question}</h2>

      {current.audioUrl && (
        <div className="panelSoft" style={{ margin: '12px 0' }}>
          <audio controls src={current.audioUrl} preload="none" />
        </div>
      )}

      <ListeningControls text={current.listeningText} storageKeyPrefix={quizType} />

      <div className="choiceList">
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
      </div>

      {showExplanation ? (
        <div className="explainBox">
          <div className="explainTitle">{correct ? '✅ 正解！' : '❌ 不正解'}</div>
          <div className="explainText">{current.explanation}</div>

          <div className="actions">
            <Button variant="main" onClick={next}>
              次へ
            </Button>
            <Button variant="accent" onClick={interrupt}>
              中断して戻る
            </Button>
          </div>
        </div>
      ) : (
        <div className="actions">
          <Button variant="accent" onClick={interrupt}>
            中断して戻る
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
