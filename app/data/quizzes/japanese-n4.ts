// app/data/quizzes/japanese-n4.ts

export type Question = {
  id: number
  question: string
  choices: string[]
  answer: number
}

export const questions: Question[] = [
  {
    id: 1,
    question: "「まってください」の正しい書き方はどれですか？",
    choices: [
      "待てください",
      "待ってください",
      "待つください",
      "待っていますください"
    ],
    answer: 1
  },
  {
    id: 2,
    question: "「行きます」のて形はどれですか？",
    choices: [
      "行いて",
      "行きて",
      "行って",
      "行った"
    ],
    answer: 2
  }
]
