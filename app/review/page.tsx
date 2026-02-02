import ReviewClient from './ReviewClient'
import type { QuizType } from '@/app/data/types'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export const dynamic = 'force-dynamic'

export default function ReviewPage({ searchParams }: Props) {
  const quizType = searchParams.type ?? 'gaikoku-license'
  return <ReviewClient quizType={quizType} />
}
