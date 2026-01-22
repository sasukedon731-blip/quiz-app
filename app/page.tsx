'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getReviewCount } from './lib/quizStats'

export default function Home() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(getReviewCount())
  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>外国免許切替クイズ</h1>

      <p>復習が必要な問題数：{count} 問</p>

      <ul>
        <li><Link href="/normal">通常モード</Link></li>
        <li><Link href="/exam">模擬試験</Link></li>
        <li><Link href="/review">復習モード</Link></li>
      </ul>
    </main>
  )
}
