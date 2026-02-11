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

// ✅ Props は quiz のみ（ここが変更点①）
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
  // NOTE: 既存仕様維持（UTC基準）
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

  // ✅ 変更点②：quizType は quiz.id から取得（唯一の真実）
  const quizType: QuizType = quiz.id

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)

  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [correct, setCorrect] = useState(false)

  // ✅ 続きから/はじめから選択
  // null: 選択待ち（確認画面表示）
  // 'continue' | 'restart': 選択済み
  const [startChoice, setStartChoice] = useState<'continue' | 'restart' | null>('restart')

  const wrongKey = `${STORAGE_WRONG_KEY}-${quizType}`
  const wrongRef = useRef<Question[]>([])

  useEffect(() => {
    indexRef.current = index
  }, [index])

  const progressKey = `${STORAGE_PROGRESS_KEY}-${quizType}`
  const sessionKey = `${STORAGE_NORMAL_SESSION_KEY}-${quizType}`

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  const startSession = (mode: 'continue' | 'restart') => {
    // wrong は常に最新を ref で保持（念のためここでも読み込み）
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

    // continue
    let loadedQuestions: Question[] | null = null
    const savedSessionRaw = localStorage.getItem(sessionKey)
    if (savedSessionRaw) {
      try {
        const d = JSON.parse(savedSessionRaw) as { questions: Question[] }
        if (Array.isArray(d.questions) && d.questions.length > 0) loadedQuestions = d.questions
      } catch {}
    }

    if (!loadedQuestions) {
      // sessionが無いなら安全に最初から
      const built = buildRandomQuestions(quiz.questions)
      setQuestions(built)
      setIndex(0)
      localStorage.setItem(sessionKey, JSON.stringify({ questions: built }))
      localStorage.removeItem(progressKey)
      return
    }

    // index
    let resumeIndex = 0
    const savedProgressRaw = localStorage.getItem(progressKey)
    if (savedProgressRaw) {
      try {
        const d = JSON.parse(savedProgressRaw) as { index?: number }
        if (typeof d.index === 'number') resumeIndex = d.index
      } catch {}
    }

    // 範囲外なら最初から（壊れ防止）
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

  // ✅ 初期化：中断があるなら「続き？最初？」を出す
  useEffect(() => {
    // 画面切替時に読み上げが残らないように
    stopSpeak()

    // wrong を読み込み
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

    // 中断 index を確認
    const savedProgressRaw = localStorage.getItem(progressKey)
    if (savedProgressRaw) {
      try {
        const d = JSON.parse(savedProgressRaw) as { index?: number }
        if (typeof d.index === 'number' && d.index > 0) {
          // ✅ 続きの可能性あり → 確認画面
          setStartChoice(null)
          return
        }
      } catch {}
    }

    // 中断なし → そのまま開始
    setStartChoice('restart')
    startSession('restart')

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizType])

  // ✅ 離脱時も中断保存（stale回避でrefを使う）
  useEffect(() => {
    const handler = () => {
      try {
        if (questions.length > 0) {
          localStorage.setItem(progressKey, JSON.stringify({ index: indexRef.current }))
          localStorage.setItem(wrongKey, JSON.stringify(wrongRef.current))
        }
      } catch {}
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [questions.length, progressKey, wrongKey])

  // ✅ 確認画面（続き/最初）
  if (startChoice === null) {
    return (
      <QuizLayout title={quiz.title}>
        <h2 style={{ marginTop: 0 }}>前回の続きがあります</h2>
        <p style={{ opacity: 0.85 }}>どちらから始めますか？</p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
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

        <div style={{ marginTop: 12, opacity: 0.75, fontSize: 13 }}>
          ※「はじめから」を選ぶと、通常問題の並びは新しくシャッフルされます
        </div>

        <div style={{ marginTop: 16 }}>
          <Button variant="success" onClick={goModeSelect}>
            いったん戻る
          </Button>
        </div>
      </QuizLayout>
    )
  }

  // startChoice が決まっているのに questions がまだ無いとき（初期化直後）
  if (!questions.length) return null

  const current = questions[index]

  const answer = (choiceIndex: number) => {
    if (selected !== null) return
    setSelected(choiceIndex)

    const isCorrect = choiceIndex === current.correctIndex
    setCorrect(isCorrect)
    setShowExplanation(true)

    if (isCorrect) playBeep(880, 120, 'triangle')
    else playBeep(220, 180, 'sawtooth')

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

      // ✅ 完了したら中断情報を消す
      localStorage.removeItem(progressKey)
      localStorage.removeItem(sessionKey)

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
    goModeSelect()
  }

  return (
    <QuizLayout title={quiz.title}>
      <p>
        {index + 1} / {questions.length}
      </p>

      <h2>{current.question}</h2>

      {/* ✅ MP3がある場合 */}
      {current.audioUrl && (
        <div
          style={{
            margin: '12px 0',
            padding: 12,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            background: '#f9fafb',
          }}
        >
          <audio controls src={current.audioUrl} preload="none" />
        </div>
      )}

      {/* ✅ MP3がない場合：読み上げ（強化UI） */}
      <ListeningControls text={current.listeningText} storageKeyPrefix={quizType} />

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

      {showExplanation && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{correct ? '✅ 正解！' : '❌ 不正解'}</div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{current.explanation}</div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="main" onClick={next}>
              次へ
            </Button>
            <Button variant="accent" onClick={interrupt}>
              中断して戻る
            </Button>
          </div>
        </div>
      )}

      {!showExplanation && (
        <div style={{ marginTop: 12 }}>
          <Button variant="accent" onClick={interrupt}>
            中断して戻る
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
