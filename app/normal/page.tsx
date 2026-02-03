export const dynamic = 'force-dynamic'

import NormalClient from './NormalClient'
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

export default function NormalPage({ searchParams }: Props) {
  const rawType = searchParams?.type

  if (!rawType || !isQuizType(rawType)) {
    return <div className="container">クイズ種別がありません</div>
  }

  const quizType = rawType
  const quiz = quizzes[quizType]

  if (!quiz) {
    return <div className="container">クイズが見つかりません</div>
  }

  return <NormalClient quiz={quiz} quizType={quizType} />
}
