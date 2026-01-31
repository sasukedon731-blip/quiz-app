import { quizzes, type QuizType } from '@/app/data/quizzes'
import QuizClient from './QuizClient'

type Props = {
  searchParams: { type?: QuizType }
}

export default function QuizPage({ searchParams }: Props) {
  const type: QuizType = searchParams.type ?? 'gaikoku'
  const quiz = quizzes[type]

  if (!quiz) {
    return <p>クイズが見つかりません</p>
  }

  return (
    <QuizClient
      title={quiz.title}
      questions={quiz.questions}
    />
  )
}
