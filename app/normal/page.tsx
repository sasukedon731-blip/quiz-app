import NormalClient from './NormalClient'
import { quizzes } from '@/app/data/quizzes'

export default function NormalPage() {
  const quiz = quizzes['gaikoku-license']

  if (!quiz) {
    return <div>クイズが見つかりません</div>
  }

  return <NormalClient quiz={quiz} />
}
