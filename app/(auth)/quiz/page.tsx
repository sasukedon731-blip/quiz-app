'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { QuizType } from '@/app/data/types'

function isQuizType(v: string): v is QuizType {
  return v === 'gaikoku-license' || v === 'japanese-n4'
}

function Inner() {
  const router = useRouter()
  const sp = useSearchParams()
  const type = sp.get('type')

  useEffect(() => {
    if (type && isQuizType(type)) {
      router.replace(`/select-mode?type=${type}`)
    } else {
      router.replace('/')
    }
  }, [router, type])

  return <div className="container">移動中...</div>
}

export default function Page() {
  return (
    <Suspense fallback={<div className="container">読み込み中...</div>}>
      <Inner />
    </Suspense>
  )
}
