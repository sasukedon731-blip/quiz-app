'use client'

import { useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import { quizzes } from '@/app/data/quizzes'
import type { QuizType } from '@/app/data/types'

const QUIZ_TYPE_LABEL: Record<QuizType, { title: string; badge: string; color: string }> = {
  'gaikoku-license': {
    title: '外国免許切替',
    badge: '外国免許切替',
    color: 'bg-blue-100 text-blue-700',
  },
  'japanese-n4': {
    title: '日本語検定 N4',
    badge: '日本語検定 N4',
    color: 'bg-purple-100 text-purple-700',
  },
  'genba-listening': {
    title: '現場用語リスニング',
    badge: '現場用語リスニング',
    color: 'bg-amber-100 text-amber-800',
  },
}

function isQuizType(v: string): v is QuizType {
  return (quizzes as any)[v] != null
}

export default function SelectModeClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeRaw = searchParams.get('type') // string | null

  // ✅ 重要：render中に router.push/replace しない！
  // type が無い/不正なら「画面表示」で逃がす（ボタンで戻す）
  if (!typeRaw) {
    return (
      <QuizLayout title="モード選択">
        <p style={{ color: '#6b7280' }}>教材が指定されていません。</p>
        <Button variant="accent" onClick={() => router.push('/')}>
          教材選択へ戻る
        </Button>
      </QuizLayout>
    )
  }

  const quizType = useMemo(() => {
    return isQuizType(typeRaw) ? (typeRaw as QuizType) : null
  }, [typeRaw])

  if (!quizType) {
    return (
      <QuizLayout title="モード選択">
        <p style={{ color: '#6b7280' }}>不正な教材です：type={typeRaw}</p>
        <Button variant="accent" onClick={() => router.push('/')}>
          教材選択へ戻る
        </Button>
      </QuizLayout>
    )
  }

  const info =
    QUIZ_TYPE_LABEL[quizType] ?? {
      title: quizType,
      badge: quizType,
      color: 'bg-gray-100 text-gray-700',
    }

  return (
    <QuizLayout title="モード選択">
      <div className={`mb-4 inline-block rounded-lg px-4 py-2 text-lg font-extrabold ${info.color}`}>
        {info.badge}
      </div>

      <p className="mb-4 text-sm text-gray-600">「{info.title}」の学習モードを選択してください</p>

      <div className="space-y-3">
        <Button variant="main" onClick={() => router.push(`/normal?type=${encodeURIComponent(quizType)}`)}>
          標準問題（練習）
        </Button>

        <Button variant="main" onClick={() => router.push(`/exam?type=${encodeURIComponent(quizType)}`)}>
          模擬試験（本番形式）
        </Button>

        <Button variant="main" onClick={() => router.push(`/review?type=${encodeURIComponent(quizType)}`)}>
          復習（間違えた問題）
        </Button>
      </div>

      {quizType === 'genba-listening' && (
        <div className="mt-4 rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
          MP3がなくてもOK：問題画面の「🔊 音声を聞く」で読み上げ学習できます。
        </div>
      )}

      <div className="mt-6">
        <Button variant="accent" onClick={() => router.push('/')}>
          教材選択に戻る
        </Button>
      </div>
    </QuizLayout>
  )
}
