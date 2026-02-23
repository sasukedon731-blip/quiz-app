// app/components/QuestionImage.tsx
'use client'

import type { Question } from '@/app/data/types'

type Props = {
  q: Question
  size?: number // 標識表示幅（px）
  mode?: 'sign' | 'auto' // auto: signId優先 / sign: 標識寄せ
}

export default function QuestionImage({ q, size = 240, mode = 'auto' }: Props) {
  // ✅ 1枚だけ出すルール
  // - auto: signId があれば signId を優先（標識は規約パスで安定）
  // - それ以外は imageUrl
  const src =
    mode === 'auto'
      ? q.signId
        ? `/signs/512/${q.signId}.png`
        : q.imageUrl ?? null
      : q.signId
        ? `/signs/512/${q.signId}.png`
        : q.imageUrl ?? null

  if (!src) return null

  const isSign = !!q.signId && (!q.imageUrl || mode === 'sign')
  const alt = q.imageAlt || (q.signId ? '標識' : '問題の画像')

  return (
    <div
      style={{
        margin: '12px 0',
        padding: 10,
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        background: '#fff',
        display: isSign ? 'flex' : 'block',
        justifyContent: isSign ? 'center' : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width: isSign ? size : '100%',
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: 10,
          objectFit: 'contain',
        }}
      />
    </div>
  )
}