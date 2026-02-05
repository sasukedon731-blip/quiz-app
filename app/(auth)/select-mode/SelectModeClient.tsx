'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import QuizLayout from '@/app/components/QuizLayout'
import Button from '@/app/components/Button'

/**
 * type（コード名） → 表示名（日本語）の対応表
 * ※ ここだけ見れば「どの教材か」一発で分かる
 */
const QUIZ_TYPE_LABEL: Record<
  string,
  { title: string; badge: string; color: string }
> = {
  // 🔹 外国免許切替
  license: {
    title: '外国免許切替',
    badge: '外国免許切替',
    color: 'bg-blue-100 text-blue-700',
  },

  // 🔹 日本語検定 N4
  n4: {
    title: '日本語検定 N4',
    badge: '日本語検定 N4',
    color: 'bg-purple-100 text-purple-700',
  },
}

export default function SelectModeClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') // string | null

  // type が無い場合は HOME へ
  if (!type) {
    router.push('/')
    return null
  }

  // 未定義 type が来ても落ちない保険
  const info =
    QUIZ_TYPE_LABEL[type] ?? {
      title: type,
      badge: type,
      color: 'bg-gray-100 text-gray-700',
    }

  return (
    <QuizLayout title="モード選択">
      {/* ✅ 今選んでいる教材を明示 */}
      <div
        className={`mb-4 inline-block rounded-lg px-4 py-2 text-lg font-extrabold ${info.color}`}
      >
        {info.badge}
      </div>

      <p className="mb-4 text-sm text-gray-600">
        「{info.title}」の学習モードを選択してください
      </p>

      <div className="space-y-3">
        <Button
          variant="main"
          onClick={() => router.push(`/normal?type=${type}`)}
        >
          標準問題（練習）
        </Button>

        <Button
          variant="main"
          onClick={() => router.push(`/exam?type=${type}`)}
        >
          模擬試験（本番形式）
        </Button>

        <Button
          variant="main"
          onClick={() => router.push(`/review?type=${type}`)}
        >
          復習（間違えた問題）
        </Button>
      </div>

      <div className="mt-6">
        <Button variant="accent" onClick={() => router.push('/')}>
          HOMEに戻る
        </Button>
      </div>
    </QuizLayout>
  )
}
