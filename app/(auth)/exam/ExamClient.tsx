'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Quiz, QuizType, Question } from '@/app/data/types'

// ✅ Firestore保存用
import { auth } from '@/app/lib/firebase'
import { db } from '@/app/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

const EXAM_TIME_SEC = 20 * 60 // 20分
const EXAM_QUESTION_COUNT = 30
const STORAGE_EXAM_SESSION_KEY = 'exam-session'

type Props = {
  quiz: Quiz
  quizType: QuizType
}

type Answer = {
  selectedIndex: number
  isCorrect: boolean
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

function buildRandomExamQuestions(all: Question[]): Question[] {
  const withShuffledChoices = all.map(shuffleQuestionChoices)
  const shuffledQuestions = shuffleArray(withShuffledChoices)
  return shuffledQuestions.slice(0, Math.min(EXAM_QUESTION_COUNT, shuffledQuestions.length))
}

export default function ExamClient({ quiz, quizType }: Props) {
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [locked, setLocked] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SEC)
  const [finished, setFinished] = useState(false)

  // ✅ 二重保存防止
  const savedRef = useRef(false)

  const total = questions.length
  const current = questions[index]

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  // ✅ 初期化（セッション復元 or 新規作成）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_EXAM_SESSION_KEY}-${quizType}`)
      if (raw) {
        const s = JSON.parse(raw)
        if (Array.isArray(s?.questions) && s.questions.length > 0) {
          setQuestions(s.questions)
          if (typeof s.index === 'number') setIndex(s.index)
          if (Array.isArray(s.answers)) setAnswers(s.answers)
          if (typeof s.timeLeft === 'number') setTimeLeft(s.timeLeft)
          if (typeof s.finished === 'boolean') setFinished(s.finished)
          return
        }
      }

      // 新規開始
      const rnd = buildRandomExamQuestions(quiz.questions)
      setQuestions(rnd)
      setIndex(0)
      setAnswers([])
      setTimeLeft(EXAM_TIME_SEC)
      setFinished(false)

      localStorage.setItem(
        `${STORAGE_EXAM_SESSION_KEY}-${quizType}`,
        JSON.stringify({
          questions: rnd,
          index: 0,
          answers: [],
          timeLeft: EXAM_TIME_SEC,
          finished: false,
        })
      )
    } catch {
      localStorage.removeItem(`${STORAGE_EXAM_SESSION_KEY}-${quizType}`)
      const rnd = buildRandomExamQuestions(quiz.questions)
      setQuestions(rnd)
      setIndex(0)
      setAnswers([])
      setTimeLeft(EXAM_TIME_SEC)
      setFinished(false)
      localStorage.setItem(
        `${STORAGE_EXAM_SESSION_KEY}-${quizType}`,
        JSON.stringify({
          questions: rnd,
          index: 0,
          answers: [],
          timeLeft: EXAM_TIME_SEC,
          finished: false,
        })
      )
    }
  }, [quizType, quiz.questions])

  // ✅ セッション保存（状態が変わったら更新）
  useEffect(() => {
    if (questions.length === 0) return
    localStorage.setItem(
      `${STORAGE_EXAM_SESSION_KEY}-${quizType}`,
      JSON.stringify({
        questions,
        index,
        answers,
        timeLeft,
        finished,
      })
    )
  }, [questions, index, answers, timeLeft, finished, quizType])

  // タイマー（試験中のみ）
  useEffect(() => {
    if (finished) return
    if (questions.length === 0) return

    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [finished, questions.length])

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
    setAnswers(prev => [...prev, { selectedIndex: i, isCorrect: ok }])

    setTimeout(() => {
      if (index + 1 < total) {
        setIndex(v => v + 1)
        setLocked(false)
      } else {
        setFinished(true)
      }
    }, 200)
  }

  const correctCount = useMemo(() => {
    return answers.filter(a => a.isCorrect).length
  }, [answers])

  // ✅ 終了したら Firestore に結果保存（1回だけ）
  useEffect(() => {
    const save = async () => {
      if (!finished) return
      if (savedRef.current) return
      if (questions.length === 0) return

      // 未ログインなら保存しない（mypageはログイン前提なので通常ここは通らない）
      const u = auth.currentUser
      if (!u) return

      savedRef.current = true

      const totalCount = questions.length
      const score = correctCount
      const accuracy = totalCount ? Math.round((score / totalCount) * 100) : 0

      try {
        await addDoc(collection(db, 'users', u.uid, 'results'), {
          quizType,          // "gaikoku-license" / "japanese-n4"
          mode: 'exam',
          score,
          total: totalCount,
          accuracy,
          createdAt: serverTimestamp(),
        })
      } catch (e) {
        // 保存失敗したら、次回の再表示で再保存できるように戻す
        savedRef.current = false
        console.error('結果保存失敗', e)
      }
    }

    save()
  }, [finished, quizType, questions.length, correctCount, db])

  const interrupt = () => {
    // セッション保存は useEffect がやってくれるので、そのまま戻る
    goModeSelect()
  }

  // 読み込み中
  if (questions.length === 0) {
    return (
      <QuizLayout title={`${quiz.title}（模擬試験）`}>
        <p>読み込み中...</p>
      </QuizLayout>
    )
  }

  // 結果画面（まとめて正誤＋解説）
  if (finished) {
    return (
      <QuizLayout title={`${quiz.title}（模擬試験 結果）`}>
        <div className="mb-4 rounded-lg border p-3">
          <div className="text-lg font-bold">
            結果：{correctCount} / {answers.length} 問正解（全{total}問）
          </div>
          <div className="mt-1 text-sm">残り時間：{timeLabel}</div>
        </div>

        <div className="space-y-4">
          {questions.slice(0, answers.length).map((q, idx) => {
            const a = answers[idx]
            const ok = a?.isCorrect

            return (
              <div
                key={idx}
                className={`rounded-lg border-2 p-3 ${
                  ok ? 'border-green-300' : 'border-red-300'
                }`}
              >
                <div className="text-sm">
                  {idx + 1} / {total}
                </div>

                <div className="mt-1 font-semibold">{q.question}</div>

                <div
                  className={`mt-3 rounded-lg px-4 py-2 text-center text-xl font-extrabold ${
                    ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {ok ? '⭕ 正解！' : '❌ 不正解'}
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

        <div className="mt-6 space-y-2">
          <Button
            variant="main"
            onClick={() => {
              // 終了後は次回のためにセッション削除（新しくランダム30問を引く）
              localStorage.removeItem(`${STORAGE_EXAM_SESSION_KEY}-${quizType}`)
              goModeSelect()
            }}
          >
            モード選択に戻る
          </Button>

          <Button
            variant="accent"
            onClick={() => {
              // もう一回（新しいランダム30問）
              localStorage.removeItem(`${STORAGE_EXAM_SESSION_KEY}-${quizType}`)
              router.push(`/exam?type=${quizType}`)
            }}
          >
            もう一度（新しい30問）
          </Button>
        </div>
      </QuizLayout>
    )
  }

  // 試験中（正解が絶対に見えない）
  return (
    <QuizLayout title={`${quiz.title}（模擬試験：${total}問）`}>
      <div className="flex items-center justify-between">
        <p>
          {index + 1} / {total}
        </p>
        <p className="font-bold">{timeLabel}</p>
      </div>

      <h2>{current.question}</h2>

      {/* isCorrect/isWrong を渡さない → 試験中に正解がバレない */}
      {current.choices.map((c, i) => (
        <Button key={i} variant="choice" onClick={() => answer(i)} disabled={locked}>
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
