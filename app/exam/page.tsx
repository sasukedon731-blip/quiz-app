'use client'

import ExamClient from './ExamClient'
import { quizzes, type QuizType } from '@/app/data/quizzes'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export default function ExamPage({ searchParams }: Props) {
  const type: QuizType = searchParams.type ?? 'gaikoku'
  const quiz = quizzes[type]

  if (!quiz) {
    return <div>クイズが見つかりません</div>
  }

  return (
    <ExamClient
      title={type === 'gaikoku' ? '外国免許切替' : '日本語N4'}
      questions={quiz} // quiz は Question[] 型なので問題なし
    />
  )
}
