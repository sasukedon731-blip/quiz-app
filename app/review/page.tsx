import ReviewClient from './ReviewClient'
import { QuizType } from '@/app/data/types'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export default function ReviewPage({ searchParams }: Props) {
  const quizType = searchParams.type ?? 'gaikoku-license'
  return <ReviewClient quizType={quizType} />
}
