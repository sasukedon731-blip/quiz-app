export type QuizType = 'gaikoku-license' | 'japanese-n4'

export type Question = {
  id: number
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export type Quiz = {
  title: string
  questions: Question[]
}
