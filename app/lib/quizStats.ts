import { Question } from '@/data/questions'

export type QuizStat = {
  correct: number
  wrong: number
}

const STORAGE_KEY = 'quizStats'

export function getQuizStats(): Record<string, QuizStat> {
  if (typeof window === 'undefined') return {}
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
}

export function saveAnswerStat(questionId: string, isCorrect: boolean) {
  const stats = getQuizStats()

  if (!stats[questionId]) {
    stats[questionId] = { correct: 0, wrong: 0 }
  }

  isCorrect ? stats[questionId].correct++ : stats[questionId].wrong++

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

export function getReviewQuestions(all: Question[]): Question[] {
  const stats = getQuizStats()

  return all.filter(q => {
    const s = stats[q.id]
    return s && s.wrong > s.correct
  })
}

export function getReviewCount(): number {
  const stats = getQuizStats()
  return Object.values(stats).filter(s => s.wrong > s.correct).length
}
