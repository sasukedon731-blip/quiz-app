'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import ListeningControls from '@/app/components/ListeningControls'
import type { Quiz, QuizType, Question } from '@/app/data/types'

import { useAuth } from '@/app/lib/useAuth'
import { db } from '@/app/lib/firebase'
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'

// ✅ 離脱/中断で読み上げ停止
import { stopSpeak } from '@/app/lib/tts'

const EXAM_TIME_SEC = 20 * 60

// ✅ 科目ごとの模擬試験出題数
function getExamQuestionCount(quizType: QuizType) {
  // 外国免許：50問
  if (quizType === 'gaikoku-license') return 50
  // それ以外：今まで通り30問（必要なら科目別に増やせる）
  return 30
}

// ✅ 科目ごとの合格ライン（表示/保存用）
function getPassScore(quizType: QuizType, total: number) {
  if (total <= 0) return 0

  // 外国免許：50問中45問（90%）
  if (quizType === 'gaikoku-license') {
    return Math.min(45, total)
  }

  // それ以外：80%（切り上げ）
  return Math.ceil(total * 0.8)
}

const STORAGE_WRONG_KEY = 'wrong'
const STORAGE_EXAM_SESSION_KEY = 'exam-session'
const STORAGE_EXAM_PROGRESS_KEY = 'exam-progress'

type Props = {
  quiz: Quiz
}

type ExamAnswer = {
  questionId: number
  selectedIndex: number | null
  correctIndex: number
  isCorrect: boolean
  question: string
  choices: string[]
  explanation?: string
  audioUrl?: string
  listeningText?: string
}

/** utils */
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

function buildExamQuestions(all: Question[], count: number): Question[] {
  const built = shuffleArray(all.map(shuffleQuestionChoices))
  return built.slice(0, Math.min(count, built.length))
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ExamClient({ quiz }: Props) {
  const router = useRouter()
  const { user } = useAuth()

  const quizType: QuizType = quiz.id

  const wrongKey = `${STORAGE_WRONG_KEY}-${quizType}`
  const sessionKey = `${STORAGE_EXAM_SESSION_KEY}-${quizType}`
  const progressKey = `${STORAGE_EXAM_PROGRESS_KEY}-${quizType}`

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  // ✅ 聴解 再生中ロック（誤タップ防止）
  const [isListeningSpeaking, setIsListeningSpeaking] = useState(false)

  // ✅ 回答後 自動で次へ進むまでの「操作ロック」
  const advancingRef = useRef(false)

  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SEC)
  const [finished, setFinished] = useState(false)

  // ✅ answers だけを真実データにする（scoreはここから必ず算出）
  const [answers, setAnswers] = useState<ExamAnswer[]>([])

  // ✅ score は answers から常に算出（中断→復帰でもズレない）
  const score = useMemo(() => answers.filter(a => a?.isCorrect).length, [answers])

  // stale対策
  const indexRef = useRef(0)
  const timeLeftRef = useRef(EXAM_TIME_SEC)
  const answersRef = useRef<ExamAnswer[]>([])
  const scoreRef = useRef(0)

  useEffect(() => {
    indexRef.current = index
  }, [index])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
  }

  /** 保存（Firestore）+ localStorage 反映 */
  const finishExam = useCallback(
    async (byTimeout: boolean) => {
      if (finished) return
      setFinished(true)
      stopSpeak()

      if (user) {
        const resultRef = doc(collection(db, 'users', user.uid, 'results'))
        await setDoc(
          resultRef,
          {
            quizType,
            mode: 'exam',
            score: scoreRef.current,
            total: questions.length,
            passScore: getPassScore(quizType, questions.length),
            passed: scoreRef.current >= getPassScore(quizType, questions.length),
            byTimeout,
            timeLeft: timeLeftRef.current,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        )
      }

      try {
        localStorage.setItem(
          sessionKey,
          JSON.stringify({
            questions,
            answers: answersRef.current,
            score: scoreRef.current,
          })
        )
        localStorage.setItem(
          progressKey,
          JSON.stringify({
            index: indexRef.current,
            timeLeft: timeLeftRef.current,
            finished: true,
          })
        )
      } catch {}
    },
    [finished, progressKey, questions, sessionKey, user, quizType]
  )

  /** 次へ（自動遷移用） */
  const goNext = useCallback(() => {
    setSelected(null)

    const nextIndex = indexRef.current + 1
    if (nextIndex >= questions.length) {
      finishExam(false).catch(() => {})
      return
    }

    setIndex(nextIndex)

    try {
      localStorage.setItem(
        progressKey,
        JSON.stringify({ index: nextIndex, timeLeft: timeLeftRef.current, finished: false })
      )
    } catch {}
  }, [finishExam, progressKey, questions.length])

  /** 初期化（復元あり） */
  useEffect(() => {
    stopSpeak()

    // ✅ 出題セットの“新旧判定”
    const contentSig = `${quizType}:${quiz.questions.length}:${quiz.questions[0]?.id ?? 0}:${quiz.questions[quiz.questions.length - 1]?.id ?? 0}`

    const savedSessionRaw = localStorage.getItem(sessionKey)
    const savedProgressRaw = localStorage.getItem(progressKey)

    if (savedSessionRaw && savedProgressRaw) {
      try {
        const s = JSON.parse(savedSessionRaw) as {
          questions: Question[]
          answers: ExamAnswer[]
          score?: number
          meta?: { contentSig?: string }
        }
        const p = JSON.parse(savedProgressRaw) as { index: number; timeLeft: number; finished?: boolean }

        const savedSig = s?.meta?.contentSig
        // ✅ 旧形式（metaなし）も含め、現行と一致しないものは復元しない
        if (!savedSig || savedSig !== contentSig) {
          throw new Error('exam session mismatch')
        }

        if (Array.isArray(s.questions) && s.questions.length > 0) {
          const restoredAnswers = Array.isArray(s.answers) ? s.answers : []

          setQuestions(s.questions)
          setAnswers(restoredAnswers)

          setIndex(typeof p.index === 'number' ? p.index : 0)
          setTimeLeft(typeof p.timeLeft === 'number' ? p.timeLeft : EXAM_TIME_SEC)
          setFinished(Boolean(p.finished))
          setSelected(null)
          return
        }
      } catch {
        // 復元失敗→新規開始
      }
    }

    const built = buildExamQuestions(quiz.questions, getExamQuestionCount(quizType))
    setQuestions(built)
    setIndex(0)
    setSelected(null)
    setTimeLeft(EXAM_TIME_SEC)
    setFinished(false)
    setAnswers([])

    localStorage.setItem(
      sessionKey,
      JSON.stringify({ questions: built, answers: [], score: 0, meta: { contentSig } })
    )
    localStorage.setItem(
      progressKey,
      JSON.stringify({ index: 0, timeLeft: EXAM_TIME_SEC, finished: false })
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizType])

  /** タイマー */
  useEffect(() => {
    if (!questions.length) return
    if (finished) return

    const t = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(t)
          finishExam(true).catch(() => {})
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(t)
  }, [questions.length, finished, finishExam])

  /** 離脱時の保存 */
  useEffect(() => {
    const handler = () => {
      try {
        if (!questions.length) return
        localStorage.setItem(
          sessionKey,
          JSON.stringify({
            questions,
            answers: answersRef.current,
            score: answersRef.current.filter(a => a?.isCorrect).length,
            meta: {
              contentSig: `${quizType}:${quiz.questions.length}:${quiz.questions[0]?.id ?? 0}:${quiz.questions[quiz.questions.length - 1]?.id ?? 0}`,
            },
          })
        )
        localStorage.setItem(
          progressKey,
          JSON.stringify({
            index: indexRef.current,
            timeLeft: timeLeftRef.current,
            finished,
          })
        )
      } catch {}
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [questions, finished, progressKey, sessionKey, quizType, quiz.questions])

  const current = useMemo(() => {
    if (!questions.length) return null
    return questions[index] ?? null
  }, [questions, index])

  /** 回答：正誤は表示しない。回答後に自動で次へ */
  const answer = (choiceIndex: number) => {
    if (!current) return
    if (selected !== null) return
    if (advancingRef.current) return

    setSelected(choiceIndex)

    const isCorrect = choiceIndex === current.correctIndex

    if (!isCorrect) {
      // wrong に追加（重複防止）
      try {
        const raw = localStorage.getItem(wrongKey)
        const arr = raw ? (JSON.parse(raw) as Question[]) : []
        const exists = Array.isArray(arr) && arr.some(q => q.id === current.id)
        if (!exists) {
          const next = Array.isArray(arr) ? [...arr, current] : [current]
          localStorage.setItem(wrongKey, JSON.stringify(next))
        }
      } catch {}
    }

    const a: ExamAnswer = {
      questionId: current.id,
      selectedIndex: choiceIndex,
      correctIndex: current.correctIndex,
      isCorrect,
      question: current.question,
      choices: current.choices,
      explanation: current.explanation,
      audioUrl: current.audioUrl,
      listeningText: current.listeningText,
    }

    setAnswers(prev => {
      const next = [...prev]
      next[indexRef.current] = a
      return next
    })

    // ✅ 自動で次へ（少しだけ間を置く）
    advancingRef.current = true
    window.setTimeout(() => {
      advancingRef.current = false
      goNext()
    }, 650)
  }

  const interrupt = () => {
    stopSpeak()
    try {
      localStorage.setItem(
        sessionKey,
        JSON.stringify({
          questions,
          answers: answersRef.current,
          // ✅ scoreはanswersから算出して保存（ズレ防止）
          score: answersRef.current.filter(a => a?.isCorrect).length,
          meta: {
            contentSig: `${quizType}:${quiz.questions.length}:${quiz.questions[0]?.id ?? 0}:${quiz.questions[quiz.questions.length - 1]?.id ?? 0}`,
          },
        })
      )
      localStorage.setItem(
        progressKey,
        JSON.stringify({
          index: indexRef.current,
          timeLeft: timeLeftRef.current,
          finished,
        })
      )
    } catch {}
    goModeSelect()
  }

  const resetExam = () => {
    stopSpeak()

    const built = buildExamQuestions(quiz.questions, getExamQuestionCount(quizType))
    setQuestions(built)
    setIndex(0)
    setSelected(null)
    setTimeLeft(EXAM_TIME_SEC)
    setFinished(false)
    setAnswers([])

    try {
      const contentSig = `${quizType}:${quiz.questions.length}:${quiz.questions[0]?.id ?? 0}:${quiz.questions[quiz.questions.length - 1]?.id ?? 0}`
      localStorage.setItem(
        sessionKey,
        JSON.stringify({ questions: built, answers: [], score: 0, meta: { contentSig } })
      )
      localStorage.setItem(
        progressKey,
        JSON.stringify({ index: 0, timeLeft: EXAM_TIME_SEC, finished: false })
      )
    } catch {}
  }

  if (!questions.length || !current) return null

  if (finished) {
    const total = questions.length
    const pct = total > 0 ? Math.round((score / total) * 100) : 0
    const passScore = getPassScore(quizType, total)
    const passed = score >= passScore

    // ✅ 分野別の弱点分析（sectionId がない教材も落ちない）
    const sectionLabelMap = new Map<string, string>()
    ;(quiz.sections ?? []).forEach(s => sectionLabelMap.set(s.id, s.label))

    const sectionStats = (() => {
      type Stat = { id: string; label: string; total: number; correct: number }
      const map = new Map<string, Stat>()

      questions.forEach((q, i) => {
        const sid = q.sectionId ?? 'all'
        const label = sectionLabelMap.get(sid) ?? (sid === 'all' ? '全体' : sid)

        const a = answers[i]
        const selectedIdx = a?.selectedIndex ?? null
        const correctIdx = a?.correctIndex ?? q.correctIndex
        const isCorrect = selectedIdx !== null && selectedIdx === correctIdx

        const cur = map.get(sid) ?? { id: sid, label, total: 0, correct: 0 }
        cur.total += 1
        if (isCorrect) cur.correct += 1
        map.set(sid, cur)
      })

      const arr = Array.from(map.values()).map(s => {
        const accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
        return { ...s, accuracy, wrong: s.total - s.correct }
      })

      // 弱い順（正答率が低い→間違い数が多い→出題数が多い）
      arr.sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong || b.total - a.total)
      return arr
    })()

    const goReview = () => router.push(`/review?type=${quizType}`)
    const goNormal = () => router.push(`/normal?type=${quizType}`)

    return (
      <QuizLayout title={`${quiz.title}（模擬試験）結果`}>
        <div className="resultMeta">
          <div style={{ fontWeight: 900, fontSize: 20 }}>
            {score} / {total}（{pct}%）
          </div>
          <div style={{ fontWeight: 800, marginTop: 6 }}>
            {passed ? '🎉 合格' : '❗ 不合格'}（合格ライン: {passScore} / {total}）
          </div>
          <div style={{ opacity: 0.8 }}>残り時間: {formatTime(timeLeft)}</div>
        </div>

        <div className="panelSoft" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>弱点分析（分野別）</div>

          {sectionStats.length <= 1 ? (
            <div style={{ opacity: 0.85 }}>この教材は分野設定がないため、分野別分析はありません。</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ opacity: 0.9 }}>正答率が低い分野から表示します（未回答は不正解としてカウント）。</div>

              {sectionStats
                .filter(s => s.id !== 'all')
                .slice(0, 5)
                .map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontWeight: 800 }}>{s.label}</div>
                    <div style={{ whiteSpace: 'nowrap' }}>
                      {s.correct}/{s.total}（{s.accuracy}%）
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="actions">
          <Button variant="main" onClick={resetExam}>
            もう一度（再挑戦）
          </Button>
          <Button variant="choice" onClick={goReview}>
            復習へ（間違えた問題）
          </Button>
          <Button variant="sub" onClick={goNormal}>
            通常学習へ
          </Button>
          <Button variant="accent" onClick={goModeSelect}>
            モード選択へ戻る
          </Button>
        </div>

        <hr />

        <h3 style={{ marginTop: 0 }}>解答・解説（全問）</h3>

        <div className="resultList">
          {questions.map((q, i) => {
            const a = answers[i]
            const selectedIdx = a?.selectedIndex ?? null
            const correctIdx = a?.correctIndex ?? q.correctIndex

            return (
              <div key={q.id} className="resultItem">
                <div className="resultHead">
                  <div className="resultQ">
                    Q{i + 1}. {q.question}
                  </div>
                  <div className="resultMark">{selectedIdx === null ? '—' : selectedIdx === correctIdx ? '✅' : '❌'}</div>
                </div>

                {q.audioUrl && (
                  <div style={{ marginTop: 10 }}>
                    <audio controls src={q.audioUrl} preload="none" />
                  </div>
                )}

                <div style={{ marginTop: 10 }}>
                  <ListeningControls text={q.listeningText} storageKeyPrefix={`${quizType}-exam-result-${q.id}`} />
                </div>

                <div className="resultChoices">
                  {q.choices.map((c, idx) => {
                    const isCorrect = idx === correctIdx
                    const isSelected = selectedIdx === idx
                    const badge = isCorrect ? '（正）' : isSelected ? '（選）' : ''
                    return (
                      <div key={idx} style={{ opacity: isCorrect || isSelected ? 1 : 0.85 }}>
                        {idx + 1}. {c} {badge}
                      </div>
                    )
                  })}
                </div>

                {q.explanation && <div className="resultExplain">{q.explanation}</div>}
              </div>
            )
          })}
        </div>
      </QuizLayout>
    )
  }

  return (
    <QuizLayout title={`${quiz.title}（模擬試験）`} subtitle="回答すると自動で次の問題へ進みます（正誤は表示されません）">
      <div className="kicker">
        <span className="badge">模擬</span>
        <span>
          {index + 1} / {questions.length}
        </span>
        <span className="spacer" />
        <span className="timer">残り {formatTime(timeLeft)}</span>
      </div>

      <h2 className="question">{current.question}</h2>

      {current.audioUrl && (
        <div className="panelSoft" style={{ margin: '12px 0' }}>
          <audio controls src={current.audioUrl} preload="none" />
        </div>
      )}

      <ListeningControls
        key={`${quizType}-${current.id}`}
        text={current.listeningText}
        storageKeyPrefix={`${quizType}-exam-${current.id}`}
        allowAutoPlay={false}
        maxPlays={2}
        onSpeakingChange={setIsListeningSpeaking}
      />

      <div className="choiceList">
        {current.choices.map((c, i) => {
          const isChosen = selected !== null && i === selected
          return (
            <Button
              key={i}
              variant={isChosen ? 'sub' : 'choice'}
              onClick={() => answer(i)}
              disabled={selected !== null || isListeningSpeaking}
              isCorrect={false}
              isWrong={false}
            >
              {c}
            </Button>
          )
        })}
      </div>

      <p className="note">※ 中断すると途中から再開できます（タイマーも保存されます）</p>

      <div className="actions">
        <Button variant="sub" onClick={interrupt}>
          中断して戻る
        </Button>
      </div>
    </QuizLayout>
  )
}