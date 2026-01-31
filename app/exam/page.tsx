import { quizzes } from '@/app/data/quizzes'
import ExamClient from './ExamClient'

type Props = {
  searchParams: { type?: string }
}

export default function ExamPage({ searchParams }: Props) {
  const type = searchParams.type ?? 'gaikoku'
  const quiz = quizzes[type]

  if (!quiz) {
    return <div>クイズが見つかりません</div>
  }

  return (
    <ExamClient
      title={quiz.title}
      questions={quiz.questions}
    />
  )
}
