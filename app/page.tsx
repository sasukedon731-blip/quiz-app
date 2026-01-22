'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getReviewCount } from '@/app/lib/quizStats'

export default function Home() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(getReviewCount())
  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>運転免許 学科クイズ</h1>

      <ul>
        <li><Link href="/normal">通常モード</Link></li>
        <li><Link href="/exam">模擬試験</Link></li>
        <li><Link href="/review">復習モード（{count}問）</Link></li>
      </ul>
    </main>
  )
}
