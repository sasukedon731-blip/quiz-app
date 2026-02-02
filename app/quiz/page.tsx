import QuizClient from './QuizClient'
import { quizzes } from '@/app/data/quizzes'
import type { QuizType } from '@/app/data/types'

type Props = {
  searchParams: {
    type?: string
  }
}

// /quiz は「クイズトップ」ページ
// Server Component で searchParams を受け取り、Client に渡します
export default function QuizPage({ searchParams }: Props) {
  const raw = searchParams.type ?? 'gaikoku-license'

  // URL が壊れていても落ちないように保護
  const quizType = (raw === 'gaikoku-license' || raw === 'japanese-n4'
    ? raw
    : 'gaikoku-license') as QuizType

  const quiz = quizzes[quizType]

  if (!quiz) {
    return <div className="container">クイズがありません</div>
  }

  return <QuizClient quiz={quiz} quizType={quizType} />
}
