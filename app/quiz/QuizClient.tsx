'use client'

import { useRouter } from 'next/navigation'
import type { Quiz } from '@/app/data/types'
import Button from '@/app/components/Button'

type Props = {
  quiz: Quiz
  quizType: string
}

export default function QuizClient({ quiz, quizType }: Props) {
  const router = useRouter()

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>全{quiz.questions.length}問</p>

      <Button onClick={() => router.push(`/normal?type=${quizType}`)}>
        通常問題
      </Button>

      <Button onClick={() => router.push(`/exam?type=${quizType}`)}>
        模擬試験
      </Button>

      <Button onClick={() => router.push(`/review?type=${quizType}`)}>
        復習モード
      </Button>
    </div>
  )
}
