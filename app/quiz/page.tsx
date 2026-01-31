import { quizzes } from '@/app/data/quizzes'
import QuizClient from './QuizClient'

type Props = {
  searchParams: { type?: string }
}

export default function QuizPage({ searchParams }: Props) {
  const type = searchParams.type ?? 'gaikoku'
  const quiz = quizzes[type]

  if (!quiz) {
    return <p>クイズが見つかりません</p>
  }

  return (
    <QuizClient quiz={quiz} />
  )
}
