'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ReviewClient from './ReviewClient'
import type { QuizType } from '@/app/data/types'

function isQuizType(v: string): v is QuizType {
  return v === 'gaikoku-license' || v === 'japanese-n4'
}

function Inner() {
  const sp = useSearchParams()
  const raw = sp.get('type')

  if (!raw || !isQuizType(raw)) {
    return <div className="container">クイズ種別がありません</div>
  }

  return <ReviewClient quizType={raw} />
}

export default function Page() {
  return (
    <Suspense fallback={<div className="container">読み込み中...</div>}>
      <Inner />
    </Suspense>
  )
}
