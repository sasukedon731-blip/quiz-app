import { quizzes } from "@/app/data/quizzes"
import type { Quiz, QuizType, QuizSection } from "@/app/data/types"
import { attachAudioUrls } from "@/app/lib/audio"
import { getQuizDef } from "@/app/data/quizCatalog"

/**
 * QuizType → 実体 Quiz（questions 含む）を取得
 * quiz.sections が無い教材は quizCatalog の sections を注入して分野タブ対応
 */
export function getQuizByType(type: QuizType): Quiz | null {
  const base = quizzes[type] ?? null
  if (!base) return null

  // 既に sections がある教材はそのまま
  if (Array.isArray((base as any).sections) && (base as any).sections.length > 0) {
    return attachAudioUrls(base)
  }

  const def = getQuizDef(type)

  const injected: QuizSection[] =
    def?.sections
      ?.filter((s) => s.enabled && s.id !== "all")
      ?.sort((a, b) => a.order - b.order)
      ?.map((s) => ({ id: s.id, label: s.title })) ?? []

  return attachAudioUrls({
    ...base,
    sections: injected.length ? injected : undefined,
  })
}