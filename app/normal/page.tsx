import { quizzes } from '@/app/data/quizzes'
import NormalClient from './NormalClient'

export default function NormalPage() {
  const quiz = quizzes.gaikoku

  if (!quiz) {
    return <div>クイズが見つかりません</div>
  }

  // Question[] をそのまま渡す
  return <NormalClient questions={quiz} />
}
