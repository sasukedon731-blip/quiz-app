'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/app/components/Button'
import type { QuizType } from '@/app/data/types'

export default function SelectModeClient() {
  const router = useRouter()
  const params = useSearchParams()

  const quizType = params.get('type') as QuizType | null

  if (!quizType) {
    return <div className="container">クイズ種別がありません</div>
  }

  return (
    <div className="container">
      <h1>モード選択</h1>

      <Button onClick={() => router.push(`/normal?type=${quizType}`)}>
        通常問題
      </Button>

      <Button onClick={() => router.push(`/exam?type=${quizType}`)}>
        模擬試験
      </Button>

      <Button onClick={() => router.push(`/review?type=${quizType}`)}>
        復習問題
      </Button>

      <Button onClick={() => router.push(`/quiz?type=${quizType}`)}>
        クイズトップに戻る
      </Button>
    </div>
  )
}
