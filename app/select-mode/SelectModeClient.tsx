'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/app/components/Button'
import type { QuizType } from '@/app/data/types'

function isQuizType(v: string): v is QuizType {
  return v === 'gaikoku-license' || v === 'japanese-n4'
}

export default function SelectModeClient() {
  const router = useRouter()
  const params = useSearchParams()

  const raw = params.get('type')

  if (!raw || !isQuizType(raw)) {
    return <div className="container">クイズ種別がありません</div>
  }

  const quizType = raw

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

      {/* ✅ 旧「クイズトップ(/quiz)」は廃止して HOME に戻す */}
      <Button onClick={() => router.push(`/`)}>
        HOMEに戻る
      </Button>
    </div>
  )
}
