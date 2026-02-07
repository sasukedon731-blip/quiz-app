'use client'

import { useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'
import { quizzes } from '@/app/data/quizzes'
import type { QuizType } from '@/app/data/types'

/**
 * type（コード名） → 表示名（日本語）の対応表
 * ※ ここだけ見れば「どの教材か」一発で分かる
 * ✅ 実際のクエリ(type=...)と一致させる
 */
const QUIZ_TYPE_LABEL: Record<
  QuizType,
  { title: string; badge: string; color: string }
> = {
  // 🔹 外国免許切替
  'gaikoku-license': {
    title: '外国免許切替',
    badge: '外国免許切替',
    color: 'bg-blue-100 text-blue-700',
  },

  // 🔹 日本語検定 N4
  'japanese-n4': {
    title: '日本語検定 N4',
    badge: '日本語検定 N4',
    color: 'bg-purple-100 text-purple-700',
  },

  // 🔹 現場用語リスニング
  'genba-listening': {
    title: '現場用語リスニング',
    badge: '現場用語リスニング',
    color: 'bg-amber-100 text-amber-800',
  },
}

export default function SelectModeClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeRaw = searchParams.get('type') // string | null

  // type が無い場合は HOME へ
  if (!typeRaw) {
    router.push('/')
    return null
  }

  // ✅ quizzes に存在するものだけ通す（追加に強い）
  const quizType = useMemo(() => {
    const t = typeRaw as QuizType
    return quizzes[t] ? t : null
  }, [typeRaw])

  // ✅ 存在しない type は HOME に戻す（あなたの仕様に合わせて落とさない）
  if (!quizType) {
    router.push('/')
    return null
  }

  // 未定義でも落ちない（基本は定義される）
  const info =
    QUIZ_TYPE_LABEL[quizType] ?? {
      title: quizType,
      badge: quizType,
      color: 'bg-gray-100 text-gray-700',
    }

  return (
    <QuizLayout title="モード選択">
      {/* ✅ 今選んでいる教材を明示 */}
      <div className={`mb-4 inline-block rounded-lg px-4 py-2 text-lg font-extrabold ${info.color}`}>
        {info.badge}
      </div>

      <p className="mb-4 text-sm text-gray-600">
        「{info.title}」の学習モードを選択してください
      </p>

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

      {/* ✅ 現場用語だけ補足（任意） */}
      {quizType === 'genba-listening' && (
        <div className="mt-4 rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
          MP3がなくてもOK：問題画面の「🔊 音声を聞く」で読み上げ学習できます。
        </div>
      )}

      <div className="mt-6">
        <Button variant="accent" onClick={() => router.push('/')}>
          HOMEに戻る
        </Button>
      </div>
    </QuizLayout>
  )
}
