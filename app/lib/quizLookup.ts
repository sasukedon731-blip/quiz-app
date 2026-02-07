// app/lib/quizLookup.ts
import { quizzes } from "@/app/data/quizzes"
import type { Quiz, QuizType } from "@/app/data/types"

export function getQuizFromType(typeRaw: string | null): { quizType: QuizType; quiz: Quiz } | null {
  if (!typeRaw) return null
  const t = typeRaw as QuizType
  const quiz = (quizzes as any)[t] as Quiz | undefined
  if (!quiz) return null
  return { quizType: t, quiz }
}
