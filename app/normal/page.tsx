import NormalClient from './NormalClient'
import { quizzes } from '@/app/data/quizzes'
import type { QuizType } from '@/app/data/types'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export default function NormalPage({ searchParams }: Props) {
  const quizType: QuizType = searchParams.type ?? 'gaikoku-license'
  const quiz = quizzes[quizType]

  if (!quiz) {
    return <div>クイズが見つかりません</div>
  }

  return <NormalClient quiz={quiz} quizType={quizType} />
}
