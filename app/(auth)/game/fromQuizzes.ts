import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import type { GameQuestion } from "./types"

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * ✅ 既存 quizzes[quizType].questions から GameQuestion を生成
 * - まずは「4択タイル（fill）」として確実に成立させる
 * - reading / particle への変換は後で段階的に強化できる
 */
export function buildGamePoolFromQuizzes(quizType: QuizType): GameQuestion[] {
  const quiz = quizzes[quizType]
  if (!quiz) return []

  return quiz.questions.map((qq, index) => {
    const correct = String(qq.choices[qq.correctIndex] ?? "").trim()
    let choices = qq.choices.map((c) => String(c ?? "").trim()).filter(Boolean)

    // 念のため正解が choices に含まれない事故を防ぐ
    if (!choices.includes(correct)) choices = [correct, ...choices]
    choices = uniq(choices)
    if (choices.length > 10) choices = choices.slice(0, 10)

    return {
      id: `${quizType}-${index}`,
      quizType,
      enabled: true,
      type: "fill",
      prompt: String(qq.question ?? "").trim(),
      answer: [correct],
      choices: shuffle(choices),
      // 今は固定。将来N5〜N1を持たせるならここを割り当て
      difficulty: "N5",
    }
  })
}
