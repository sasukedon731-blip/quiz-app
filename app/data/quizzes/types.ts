// app/data/quizzes/types.ts
export type Question = {
  id: number
  question: string
  choices: string[]
  answer: number
  explanation?: string
}
