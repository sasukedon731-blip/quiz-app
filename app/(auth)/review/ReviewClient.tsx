'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Question, Quiz, QuizType } from '@/app/data/types'

import { canSpeak, speak, stopSpeak } from '@/app/lib/tts'

const STORAGE_WRONG_KEY = 'wrong'

type Props = {
  quiz: Quiz
}

// ✅ 既存互換を崩さないため「idは number 想定」維持しつつ、落ちにくい判定にする
function isQuestionLike(v: any): v is Question {
  return (
    v &&
    typeof v === 'object' &&
    (typeof v.id === 'number' || typeof v.id === 'string') &&
    typeof v.question === 'string' &&
    Array.isArray(v.choices) &&
    typeof v.correctIndex === 'number'
  )
}

// ✅ id が number / string どちらでも一意化できる
function uniqById(list: Question[]) {
  return Array.from(new Map(list.map(q => [String((q as any).id), q])).values())
}

export default function ReviewClient({ quiz }: Props) {
  const router = useRouter()

  // ✅ Normal / Exam と同じ：唯一の真実は quiz.id
  const quizType: QuizType = quiz.id

  const storageKey = `${STORAGE_WRONG_KEY}-${quizType}`

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const goModeSelect = () => {
    stopSpeak()
    router.push(`/select-mode?type=${encodeURIComponent(quizType)}`)
  }

  // 初回ロード：wrong-${quizType}（Question[]）を読む
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) {
        setQuestions([])
        setIndex(0)
        setSelected(null)
        return
      }

      const data = JSON.parse(saved)

      if (Array.isArray(data)) {
        const list = uniqById(data.filter(isQuestionLike) as Question[])
        setQuestions(list)
        setIndex(0)
        setSelected(null)
        return
      }

      setQuestions([])
      setIndex(0)
      setSelected(null)
    } catch {
      localStorage.removeItem(storageKey)
      setQuestions([])
      setIndex(0)
      setSelected(null)
    }
  }, [storageKey])

  // ✅ 問題が切り替わったら読み上げ停止（音が残らない）
  useEffect(() => {
    stopSpeak()
  }, [index])

  // ✅ 画面離脱時にも停止
  useEffect(() => {
    return () => stopSpeak()
  }, [])

  const current = questions[index]
  const answered = selected !== null

  const isCorrect = useMemo(() => {
    if (!current || selected === null) return false
    return selected === current.correctIndex
  }, [current, selected])

  // ✅ 正解した問題を wrong から削除（localStorage & state 両方）
  const removeCurrentFromWrong = (qid: any) => {
    const key = String(qid)

    setQuestions(prev => {
      const next = prev.filter(q => String((q as any).id) !== key)

      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {}

      setIndex(i => {
        const max = Math.max(0, next.length - 1)
        return Math.min(i, max)
      })

      return next
    })
  }

  // 復習対象なし
  if (!questions || questions.length === 0) {
    return (
      <QuizLayout title={`${quiz.title}（復習）`} subtitle="復習リストは空です">
        <p className="note">復習する問題はありません</p>
        <div className="actions">
          <Button variant="accent" onClick={goModeSelect}>
            モード選択に戻る
          </Button>
        </div>
      </QuizLayout>
    )
  }

  // current がない（保険）
  if (!current) {
    return (
      <QuizLayout title={`${quiz.title}（復習）`} subtitle="読み込みエラー">
        <p className="note">問題の読み込みに失敗しました</p>
        <div className="actions">
          <Button variant="accent" onClick={goModeSelect}>
            モード選択に戻る
          </Button>
        </div>
      </QuizLayout>
    )
  }

  const answer = (i: number) => {
    if (answered) return
    stopSpeak()
    setSelected(i)
  }

  const onListen = () => {
    if ((current as any).listeningText) {
      speak((current as any).listeningText, { lang: 'ja-JP', rate: 0.9, pitch: 1.0 })
    }
  }

  const next = () => {
    if (!current) return
    stopSpeak()

    if (isCorrect) {
      const qid = (current as any).id
      setSelected(null)

      const willBe = questions.filter(q => String((q as any).id) !== String(qid))
      if (willBe.length === 0) {
        try {
          localStorage.setItem(storageKey, JSON.stringify([]))
        } catch {}
        goModeSelect()
        return
      }

      removeCurrentFromWrong(qid)
      return
    }

    setSelected(null)
    if (index + 1 < questions.length) {
      setIndex(prev => prev + 1)
    } else {
      goModeSelect()
    }
  }

  const isLastNow = index >= questions.length - 1

  return (
    <QuizLayout title={`${quiz.title}（復習）`} subtitle="正解した問題はリストから消えます">
      <div className="kicker">
        <span className="badge">復習</span>
        <span>
          {index + 1} / {questions.length}
        </span>
      </div>

      <h2 className="question">{current.question}</h2>

      {/* ✅ Listening UI（MP3なくてもOK） */}
      {(((current as any).audioUrl as string | undefined) || (current as any).listeningText) && (
        <div className="panelSoft" style={{ margin: '12px 0' }}>
          {(current as any).audioUrl ? (
            <audio controls src={(current as any).audioUrl as string} preload="none" />
          ) : (
            <div className="listenRow">
              <Button variant="sub" onClick={onListen} disabled={!canSpeak()}>
                🔊 音声を聞く
              </Button>
              <Button variant="sub" onClick={() => stopSpeak()}>
                ⏹ 停止
              </Button>
              {!canSpeak() && (
                <span className="listenHint">
                  この端末/ブラウザでは読み上げが使えない可能性があります（別ブラウザをお試しください）
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="choiceList">
        {current.choices.map((c, i) => (
          <Button
            key={i}
            variant="choice"
            onClick={() => answer(i)}
            disabled={answered}
            isCorrect={answered && i === current.correctIndex}
            isWrong={answered && i === selected && i !== current.correctIndex}
          >
            {c}
          </Button>
        ))}
      </div>

      {answered ? (
        <div className="explainBox">
          <div className="explainTitle">
            {isCorrect ? '⭕ 正解！（この問題は復習リストから消えます）' : '❌ 不正解（復習に残します）'}
          </div>

          {(current as any).explanation && <p className="explainText">{(current as any).explanation}</p>}

          <div className="actions">
            <Button variant="main" onClick={next}>
              {isCorrect ? '次へ（克服して進む）' : isLastNow ? '終了（モード選択へ）' : '次へ'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="actions">
          <Button variant="accent" onClick={goModeSelect}>
            モード選択に戻る
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
