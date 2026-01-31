import ExamClient from './ExamClient'
import { quizzes } from '@/app/data/quizzes'
import { QuizType } from '@/app/data/types'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export default function ExamPage({ searchParams }: Props) {
  const quizType = searchParams.type ?? 'gaikoku-license'
  const quiz = quizzes[quizType]

  return <ExamClient quiz={quiz} />
}
