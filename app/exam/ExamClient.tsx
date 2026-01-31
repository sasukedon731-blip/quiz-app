'use client'

import { Quiz } from '@/app/data/types'

type Props = {
  quiz: Quiz
}

export default function ExamClient({ quiz }: Props) {
  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>全 {quiz.questions.length} 問</p>
    </div>
  )
}
