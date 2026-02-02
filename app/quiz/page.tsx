import { quizzes } from '@/app/data/quizzes'
import { QuizType } from '@/app/data/types'
import Link from 'next/link'

type Props = {
  searchParams: {
    type?: QuizType
  }
}

export default function QuizPage({ searchParams }: Props) {
  const quizType = searchParams.type ?? 'gaikoku-license'
  const quiz = quizzes[quizType]

  if (!quiz) {
    return <div className="container">クイズがありません</div>
  }

  return (
    <main className="container">
      <h1>{quiz.title}</h1>
      <p>全 {quiz.questions.length} 問</p>

      <Link href={`/normal?type=${quizType}`}>通常問題</Link><br />
      <Link href={`/exam?type=${quizType}`}>模擬試験</Link><br />
      <Link href={`/review?type=${quizType}`}>復習問題</Link><br />
      <Link href="/">TOPへ戻る</Link>
    </main>
  )
}
