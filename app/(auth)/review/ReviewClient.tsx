'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Question, QuizType } from '@/app/data/types'

import { canSpeak, speak, stopSpeak } from '@/app/lib/tts'

const STORAGE_WRONG_KEY = 'wrong'

type Props = {
  quizType: QuizType
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

export default function ReviewClient({ quizType }: Props) {
  const router = useRouter()

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

    // state更新（画面上のリストから消す）
    setQuestions(prev => {
      const next = prev.filter(q => String((q as any).id) !== key)

      // localStorage も同期
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {}

      // index 調整：末尾を消して index がはみ出すのを防ぐ
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
      <QuizLayout title="復習モード">
        <p>復習する問題はありません</p>
        <Button variant="accent" onClick={goModeSelect}>
          モード選択に戻る
        </Button>
      </QuizLayout>
    )
  }

  // current がない（保険）
  if (!current) {
    return (
      <QuizLayout title="復習モード">
        <p>問題の読み込みに失敗しました</p>
        <Button variant="accent" onClick={goModeSelect}>
          モード選択に戻る
        </Button>
      </QuizLayout>
    )
  }

  const answer = (i: number) => {
    if (answered) return
    stopSpeak() // ✅ 回答時に停止（読み上げが続かない）
    setSelected(i)
  }

  const onListen = () => {
    // MP3がない前提：listeningText を読み上げ
    // audioUrl があるなら audio が表示されるので不要
    if ((current as any).listeningText) {
      speak((current as any).listeningText, { lang: 'ja-JP', rate: 0.9, pitch: 1.0 })
    }
  }

  const next = () => {
    if (!current) return
    stopSpeak()

    // ✅ 正解なら弱点リストから削除
    if (isCorrect) {
      const qid = (current as any).id

      // 先に選択状態をリセット（UI安定）
      setSelected(null)

      // 削除後の表示を決める
      const willBe = questions.filter(q => String((q as any).id) !== String(qid))
      if (willBe.length === 0) {
        // 全部克服！
        try {
          localStorage.setItem(storageKey, JSON.stringify([]))
        } catch {}
        goModeSelect()
        return
      }

      // index は removeCurrentFromWrong 内で安全に調整される
      removeCurrentFromWrong(qid)
      return
    }

    // ❌ 不正解は残す：普通に次へ
    setSelected(null)
    if (index + 1 < questions.length) {
      setIndex(prev => prev + 1)
    } else {
      // 最後まで見たらモード選択へ（不正解が残るので次回来るとまた出る）
      goModeSelect()
    }
  }

  const isLastNow = index >= questions.length - 1

  return (
    <QuizLayout title="復習モード">
      <p>
        {index + 1} / {questions.length}
      </p>

      <h2>{current.question}</h2>

      {/* ✅ Listening UI（MP3なくてもOK） */}
      {(((current as any).audioUrl as string | undefined) || (current as any).listeningText) && (
        <div
          style={{
            margin: '12px 0',
            padding: 12,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            background: '#f9fafb',
          }}
        >
          {(current as any).audioUrl ? (
            <audio controls src={(current as any).audioUrl as string} preload="none" />
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onListen}
                disabled={!canSpeak()}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  cursor: canSpeak() ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                }}
              >
                🔊 音声を聞く
              </button>

              <button
                type="button"
                onClick={() => stopSpeak()}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ⏹ 停止
              </button>

              {!canSpeak() && (
                <small style={{ color: '#6b7280' }}>
                  この端末/ブラウザでは読み上げが使えない可能性があります（別ブラウザをお試しください）
                </small>
              )}
            </div>
          )}
        </div>
      )}

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

      {answered && (
        <div className="mt-4">
          <p>{isCorrect ? '⭕ 正解！（この問題は復習リストから消えます）' : '❌ 不正解（復習に残します）'}</p>
          {(current as any).explanation && (
            <p className="mt-2 whitespace-pre-wrap">{(current as any).explanation}</p>
          )}

          <Button variant="main" onClick={next}>
            {isCorrect ? '次へ（克服して進む）' : isLastNow ? '終了（モード選択へ）' : '次へ'}
          </Button>
        </div>
      )}

      {!answered && (
        <div className="mt-4">
          <Button variant="accent" onClick={goModeSelect}>
            モード選択に戻る
          </Button>
        </div>
      )}
    </QuizLayout>
  )
}
