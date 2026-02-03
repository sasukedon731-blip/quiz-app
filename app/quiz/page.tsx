export const dynamic = 'force-dynamic'

import QuizClient from './QuizClient'
import { quizzes } from '@/app/data/quizzes'
import type { QuizType } from '@/app/data/types'

type Props = {
  searchParams?: {
    type?: string
  }
}

function isQuizType(v: string): v is QuizType {
  return v === 'gaikoku-license' || v === 'japanese-n4'
}

// /quiz は「クイズトップ」ページ
// Server Component で searchParams を受け取り、Client に渡します
export default function QuizPage({ searchParams }: Props) {
  const raw = searchParams?.type

  if (!raw || !isQuizType(raw)) {
    return <div className="container">クイズ種別がありません</div>
  }

  const quizType = raw
  const quiz = quizzes[quizType]

  if (!quiz) {
    return <div className="container">クイズがありません</div>
  }

  return <QuizClient quiz={quiz} quizType={quizType} />
}
