import ExamClient from './ExamClient'
import { quizzes } from '@/app/data/quizzes'
import type { QuizType } from '@/app/data/types'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export default function ExamPage({ searchParams }: Props) {
  const quizType: QuizType = searchParams.type ?? 'gaikoku-license'
  const quiz = quizzes[quizType]

  if (!quiz) {
    return <div>クイズが見つかりません</div>
  }

  return <ExamClient quiz={quiz} quizType={quizType} />
}
