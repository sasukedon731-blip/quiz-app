import NormalClient from './NormalClient'
import { quizzes } from '@/app/data/quizzes'
import { QuizType } from '@/app/data/types'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export default function NormalPage({ searchParams }: Props) {
  const type: QuizType = searchParams.type ?? 'gaikoku-license'
  const quiz = quizzes[type]

  if (!quiz) {
    return <div>クイズが見つかりません</div>
  }

  return (
    <NormalClient
      quiz={quiz}
      quizType={type}   // ← ★これが足りなかった
    />
  )
}
