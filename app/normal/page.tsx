import NormalClient from './NormalClient'
import { quizzes } from '@/app/data/quizzes'
import type { QuizType } from '@/app/data/types'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export default function NormalPage({ searchParams }: Props) {
  if (!searchParams.type) {
    return <div>クイズ種別がありません</div>
  }

  const quizType = searchParams.type
  const quiz = quizzes[quizType]

  if (!quiz) {
    return <div>クイズが見つかりません</div>
  }

  return <NormalClient quiz={quiz} quizType={quizType} />
}
