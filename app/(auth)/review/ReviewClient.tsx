'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import type { Question, QuizType } from '@/app/data/types'

const STORAGE_WRONG_KEY = 'wrong'

type Props = {
  quizType: QuizType
}

function isQuestionLike(v: any): v is Question {
  return (
    v &&
    typeof v === 'object' &&
    typeof v.id === 'number' &&
    typeof v.question === 'string' &&
    Array.isArray(v.choices) &&
    typeof v.correctIndex === 'number'
  )
}

function uniqById(list: Question[]) {
  return Array.from(new Map(list.map(q => [q.id, q])).values())
}

export default function ReviewClient({ quizType }: Props) {
  const router = useRouter()

  const storageKey = `${STORAGE_WRONG_KEY}-${quizType}`

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const goModeSelect = () => {
    router.push(`/select-mode?type=${quizType}`)
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
        const list = uniqById((data.filter(isQuestionLike) as Question[]))
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

  const current = questions[index]
  const answered = selected !== null

  const isCorrect = useMemo(() => {
    if (!current || selected === null) return false
    return selected === current.correctIndex
  }, [current, selected])

  // ✅ 正解した問題を wrong から削除（localStorage & state 両方）
  const removeCurrentFromWrong = (qid: number) => {
    // state更新（画面上のリストから消す）
    setQuestions(prev => {
      const next = prev.filter(q => q.id !== qid)

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
    setSelected(i)
  }

  const next = () => {
    if (!current) return

    // ✅ 正解なら弱点リストから削除
    if (isCorrect) {
      const qid = current.id

      // 先に選択状態をリセット（UI安定）
      setSelected(null)

      // 削除後の表示を決める
      // - 削除すると questions が1つ減る
      // - 「同じ index の次の問題」を見せたい（末尾なら1つ前へ）
      const willBe = questions.filter(q => q.id !== qid)
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
          {current.explanation && <p className="mt-2 whitespace-pre-wrap">{current.explanation}</p>}

          <Button variant="main" onClick={next}>
            {/* 正解時：削除して次へ。不正解時：次へ or 終了 */}
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
