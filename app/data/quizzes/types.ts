// app/data/quizzes/types.ts
export interface Question {
  id: number
  question: string
  choices: string[]
  correctIndex: number
  explanation?: string
}
