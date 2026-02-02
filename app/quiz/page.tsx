// app/quiz/page.tsx
import { quizzes } from '@/app/data/quizzes'
import QuizClient from './QuizClient'
import type { QuizType } from '@/app/data/types'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export default function QuizPage({ searchParams }: Props) {
  const quizType = searchParams.type

  if (!quizType || !quizzes[quizType]) {
    return <p>クイズが見つかりません</p>
  }

  return <QuizClient quiz={quizzes[quizType]} quizType={quizType} />
}
