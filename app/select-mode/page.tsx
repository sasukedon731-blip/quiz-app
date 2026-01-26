'use client'

import { useRouter } from 'next/navigation'
import Button from '../components/Button'
import { useEffect, useState } from 'react'

export default function SelectModePage() {
  const router = useRouter()
  const [quizType, setQuizType] = useState<string | null>(null)

  useEffect(() => {
    const type = localStorage.getItem('quizType')
    if (!type) {
      router.replace('/')
    } else {
      setQuizType(type)
    }
  }, [router])

  if (!quizType) return null

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center' }}>モード選択</h1>

      <p style={{ textAlign: 'center', marginBottom: 20 }}>
        選択中のクイズ：{quizType}
      </p>

      <div className="card">
        <Button variant="main" onClick={() => router.push('/normal')}>
          通常モード
        </Button>

        <Button variant="main" onClick={() => router.push('/exam')}>
          模擬試験モード
        </Button>

        <Button variant="main" onClick={() => router.push('/review')}>
          復習モード
        </Button>
      </div>

      <Button variant="accent" onClick={() => router.push('/')}>
        TOPに戻る
      </Button>
    </div>
  )
}
