// app/(auth)/game/fromQuizzes.ts
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import type { GameQuestion, GameDifficulty } from "./types"

export type GameGenOptions = {
  difficulty?: GameDifficulty
  maxPromptChars?: number
  maxChoices?: number
  maxChoiceChars?: number
  minChoices?: number
  allowAutoTrimChoice?: boolean
}

const DEFAULT_OPTS: Required<GameGenOptions> = {
  difficulty: "N5",
  maxPromptChars: 34,
  maxChoices: 8,
  maxChoiceChars: 8,
  minChoices: 6,
  allowAutoTrimChoice: false,
}

export function buildGameQuestionsFromQuizzes(
  quizType: QuizType,
  opts?: GameGenOptions
): GameQuestion[] {
  const o = { ...DEFAULT_OPTS, ...(opts ?? {}) }
  const quiz = (quizzes as any)[quizType]
  if (!quiz?.questions || !Array.isArray(quiz.questions)) return []

  const src = quiz.questions as any[]

  const mapped = src
    .map((q, idx) => mapStudyQuestionToGameFill(q, quizType, idx, o))
    .filter((v): v is GameQuestion => !!v)

  return mapped.filter((g) => {
    if (!g.enabled) return false
    if (!g.prompt || g.prompt.length > o.maxPromptChars) return false
    if (!g.answer?.length) return false
    if (!g.choices || g.choices.length < Math.min(o.minChoices, o.maxChoices)) return false
    if (g.choices.some((c) => c.length > o.maxChoiceChars)) return false
    return true
  })
}

// ✅ 互換: 既存コードが buildGamePoolFromQuizzes をimportしても落ちない
export const buildGamePoolFromQuizzes = buildGameQuestionsFromQuizzes

function mapStudyQuestionToGameFill(
  q: any,
  quizType: QuizType,
  index: number,
  o: Required<GameGenOptions>
): GameQuestion | null {
  if (!q || typeof q !== "object") return null
  if (!Array.isArray(q.choices) || typeof q.correctIndex !== "number") return null

  const rawQuestion = String(q.question ?? "").trim()
  if (!rawQuestion) return null

  const correct = String(q.choices[q.correctIndex] ?? "").trim()
  if (!correct) return null
  if (correct.length > o.maxChoiceChars) return null

  const pool = sanitizeChoices(q.choices, correct, o)
  if (pool.length < Math.min(o.minChoices, o.maxChoices)) return null

  const prompt = clampPrompt(buildGamePrompt(rawQuestion, o), o.maxPromptChars)

  // ✅ id を必ず付与
  const srcId =
    typeof (q as any).id === "number" || typeof (q as any).id === "string"
      ? String((q as any).id)
      : `${quizType}-${index}`

  return {
    id: `qz-${quizType}-${srcId}`,
    type: "fill",
    prompt,
    answer: [correct],
    choices: pool,
    difficulty: o.difficulty,
    enabled: true,
    quizType,
  }
}

function buildGamePrompt(question: string, o: Required<GameGenOptions>) {
  const q = normalizePrompt(question)

  const hasBlank =
    /（\s*[\s　]*\s*）/.test(q) ||
    /＿{2,}/.test(q) ||
    /_{2,}/.test(q) ||
    /〔\s*〕/.test(q) ||
    /【\s*】/.test(q)

  if (isLongReadingLike(q)) return "空欄に入る言葉は？"

  if (hasBlank) {
    const snip = extractBlankSnippet(q)
    if (snip) return snip
    return "空欄に入る言葉は？"
  }

  if (/どれ|正しい|適切|意味|選び/.test(q)) return "正しい答えは？"

  return q
}

function normalizePrompt(s: string) {
  return s
    .replace(/\s+/g, " ")
    .replace(/^[【\[].*?[】\]]\s*/g, "")
    .trim()
}

function sanitizeChoices(rawChoices: any[], correct: string, o: Required<GameGenOptions>) {
  const uniq = new Map<string, string>()

  for (const c of rawChoices ?? []) {
    const v = String(c ?? "").trim()
    if (!v) continue

    if (v.length > o.maxChoiceChars) {
      if (!o.allowAutoTrimChoice) continue
      const tv = v.slice(0, Math.max(1, o.maxChoiceChars - 1)) + "…"
      uniq.set(tv, tv)
      continue
    }

    uniq.set(v, v)
  }

  if (!uniq.has(correct)) uniq.set(correct, correct)

  const all = Array.from(uniq.values()).filter((v) => v !== correct)
  const picked = pickRandom(all, Math.max(0, o.maxChoices - 1))
  const pool = shuffle([correct, ...picked])

  if (pool.length < o.minChoices) {
    const more = all.filter((v) => !pool.includes(v))
    pool.push(...pickRandom(more, o.minChoices - pool.length))
  }

  return shuffle(pool).slice(0, o.maxChoices)
}

function clampPrompt(s: string, maxChars: number) {
  const t = s.replace(/\s+/g, " ").trim()
  if (t.length <= maxChars) return t

  const cut = t.slice(0, maxChars)
  const idx = Math.max(
    cut.lastIndexOf("。"),
    cut.lastIndexOf("、"),
    cut.lastIndexOf(" "),
    cut.lastIndexOf("？"),
    cut.lastIndexOf("?")
  )
  if (idx >= Math.floor(maxChars * 0.6)) return cut.slice(0, idx + 1).trim()
  return cut.slice(0, Math.max(1, maxChars - 1)).trim() + "…"
}

function isLongReadingLike(q: string) {
  if (q.length >= 80) return true
  if (q.includes("\n")) return true
  if (/【.*?】/.test(q) && q.length >= 60) return true
  return false
}

function extractBlankSnippet(q: string) {
  const m = q.match(/(.{0,40})(（\s*）|＿{2,}|_{2,}|〔\s*〕|【\s*】)(.{0,40})/)
  if (!m) return null
  const left = (m[1] ?? "").trim()
  const blank = m[2] ?? "（ ）"
  const right = (m[3] ?? "").trim()
  const snippet = `${left}${blank}${right}`.trim()
  return snippet.length <= 120 ? snippet : snippet.slice(0, 120)
}

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom<T>(arr: T[], n: number) {
  if (n <= 0) return []
  const a = shuffle(arr)
  return a.slice(0, Math.min(n, a.length))
}