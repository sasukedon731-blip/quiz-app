import { quizzes } from '@/app/data/quizzes'
import NormalClient from './NormalClient'

export default function NormalPage() {
  const quiz = quizzes.gaikoku

  if (!quiz) {
    return <div>クイズが見つかりません</div>
  }

  return <NormalClient questions={quiz.questions} />
}
