'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Button from '../components/Button'
import Card from '../components/Card'

export default function SelectModeClient() {
  const router = useRouter()
  const params = useSearchParams()
  const type = params.get('type') // gaikoku-license | japanese-n4

  if (!type) {
    router.push('/')
    return null
  }

  return (
    <main className="container">
      <Card>
        <h2 style={{ marginBottom: 16 }}>モードを選択</h2>

        <Button
          variant="main"
          onClick={() => router.push(`/normal?type=${type}`)}
        >
          通常モード
        </Button>

        <Button
          variant="main"
          onClick={() => router.push(`/exam?type=${type}`)}
        >
          模擬試験モード
        </Button>

        <Button
          variant="main"
          onClick={() => router.push(`/review?type=${type}`)}
        >
          復習モード
        </Button>

        <Button
          variant="accent"
          onClick={() => router.push('/')}
        >
          TOPへ戻る
        </Button>
      </Card>
    </main>
  )
}
