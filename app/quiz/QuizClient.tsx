'use client'

import { useRouter } from 'next/navigation'
import type { Quiz, QuizType } from '@/app/data/types'
import Button from '@/app/components/Button'
import Card from '@/app/components/Card'

type Props = {
  quiz: Quiz
  quizType: QuizType
}

export default function QuizClient({ quiz, quizType }: Props) {
  const router = useRouter()

  return (
    <main className="container">
      <Card>
        <h1 style={{ marginBottom: 8 }}>{quiz.title}</h1>
        <p style={{ marginBottom: 16 }}>全 {quiz.questions.length} 問</p>

        <div style={{ display: 'grid', gap: 12 }}>
          <Button variant="main" onClick={() => router.push(`/normal?type=${quizType}`)}>
            通常問題
          </Button>

          <Button variant="main" onClick={() => router.push(`/exam?type=${quizType}`)}>
            模擬試験
          </Button>

          <Button variant="main" onClick={() => router.push(`/review?type=${quizType}`)}>
            復習問題
          </Button>

          <Button variant="accent" onClick={() => router.push(`/select-mode?type=${quizType}`)}>
            モード選択に戻る
          </Button>

          <Button variant="accent" onClick={() => router.push('/')}>
            TOPへ戻る
          </Button>
        </div>
      </Card>
    </main>
  )
}
