// app/(auth)/game/fromQuizzes.ts
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import type { GameQuestion, GameDifficulty, GameKind } from "./types"

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

export function buildGameQuestionsFromQuizzes(quizType: QuizType, opts?: GameGenOptions): GameQuestion[] {
  const merged = { ...DEFAULT_OPTS, ...(opts ?? {}) } as Required<GameGenOptions>

  // ✅ japanese-n4 はデフォ difficulty をN4寄せ（optsで指定があれば優先）
  const o: Required<GameGenOptions> = {
    ...merged,
    difficulty: (opts?.difficulty ?? (quizType === "japanese-n4" ? "N4" : merged.difficulty)) as GameDifficulty,
  }

  const quiz = (quizzes as any)[quizType]
  if (!quiz?.questions || !Array.isArray(quiz.questions)) return []

  const src = quiz.questions as any[]

  const mapped = src
    .map((q, idx) => mapStudyToGame(q, quizType, idx, o))
    .filter((v): v is GameQuestion => !!v)

  // 最終フィルタ（ゲーム破壊要因を除去）
  return mapped.filter((g) => {
    if (!g.enabled) return false
    if (!g.prompt || g.prompt.length > o.maxPromptChars) return false
    if (!g.answer?.length) return false

    // speed-choice は 4 択前提なので minChoices 判定を緩める
    if (g.kind === "speed-choice") {
      if (!g.choices || g.choices.length !== 4) return false
      if (g.choices.some((c) => c.length > Math.max(o.maxChoiceChars, 14))) return false
      return true
    }

    // tile-drop
    if (!g.choices || g.choices.length < Math.min(o.minChoices, o.maxChoices)) return false
    if (g.choices.some((c) => c.length > o.maxChoiceChars)) return false
    return true
  })
}

// ✅ 互換（既存importがこれでもOK）
export const buildGamePoolFromQuizzes = buildGameQuestionsFromQuizzes

// -------------------------
// 変換本体
// -------------------------
function mapStudyToGame(
  q: any,
  quizType: QuizType,
  index: number,
  o: Required<GameGenOptions>
): GameQuestion | null {
  if (!q || typeof q !== "object") return null
  if (!Array.isArray(q.choices) || typeof q.correctIndex !== "number") return null

  // ✅ 聴解は完全除外（これが最重要）
  // - japanese-n4.ts には sectionId: "listening" がある
  // - さらに将来 listeningText がある問題も弾けるようにする
  if ((q as any).sectionId === "listening") return null
  if (typeof (q as any).listeningText === "string" && String((q as any).listeningText).trim()) return null

  const rawQuestion = String(q.question ?? "").trim()
  if (!rawQuestion) return null

  const correct = String(q.choices[q.correctIndex] ?? "").trim()
  if (!correct) return null

  // ✅ id を必ず付与
  const srcId =
    typeof (q as any).id === "number" || typeof (q as any).id === "string"
      ? String((q as any).id)
      : `${quizType}-${index}`
  const id = `qz-${quizType}-${srcId}`

  // -------------------------
  // ✅ kind 判定（最優先：sectionId → fallback：旧推定）
  // -------------------------
  const sectionId = String((q as any).sectionId ?? "").trim()
  const kind = inferKindBySection(quizType, sectionId) ?? inferKindByHeuristic(rawQuestion, q.choices)

  // -------------------------
  // ✅ kind別の短文化・制約
  // -------------------------

  // --- speed-choice（4択固定：文字・語彙/漢字・読み系に最適） ---
  if (kind === "speed-choice") {
    const opts = {
      ...o,
      maxChoices: 4,
      minChoices: 4,
      maxPromptChars: Math.max(o.maxPromptChars, 42),
      maxChoiceChars: Math.max(o.maxChoiceChars, 14),
      allowAutoTrimChoice: true,
    } as Required<GameGenOptions>

    const pool = sanitizeChoices(q.choices, correct, opts)
    if (pool.length < 4) return null

    const prompt = clampPrompt(buildSpeedChoicePrompt(rawQuestion), opts.maxPromptChars)

    // ✅ N4の「文字・語彙」は speed-choice に寄せるので difficulty もN4寄せ
    const d: GameDifficulty =
      (opts.difficulty ??
        (quizType === "japanese-n4" ? "N4" : "N5")) as GameDifficulty

    return {
      id,
      kind: "speed-choice",
      type: "reading", // 表示ラベル用途（厳密じゃなくてOK）
      prompt,
      answer: [correct],
      choices: pool.slice(0, 4),
      difficulty: d,
      enabled: true,
      quizType,
    }
  }

  // --- tile-drop（テンポ重視：短いprompt + 6〜8択） ---
  {
    // tile-dropは短いchoiceが必要。正解が長すぎるなら落とす
    if (correct.length > o.maxChoiceChars) return null

    const pool = sanitizeChoices(q.choices, correct, o)
    if (pool.length < Math.min(o.minChoices, o.maxChoices)) return null

    const prompt = clampPrompt(buildTileDropPrompt(rawQuestion), o.maxPromptChars)

    return {
      id,
      kind: "tile-drop",
      type: /助詞/.test(rawQuestion) ? "particle" : "fill",
      prompt,
      answer: [correct],
      choices: pool,
      difficulty: o.difficulty,
      enabled: true,
      quizType,
    }
  }
}

// -------------------------
// ✅ sectionId ベースの kind 判定（最優先）
// -------------------------
function inferKindBySection(quizType: QuizType, sectionId: string): GameKind | null {
  // N4の構造に合わせる（あなたの japanese-n4.ts に完全一致）
  if (quizType === "japanese-n4") {
    if (sectionId === "moji-goi") return "speed-choice"
    if (sectionId === "bunpo") return "tile-drop"
    if (sectionId === "reading") return "tile-drop"
    if (sectionId === "listening") return null // ここは mapStudyToGame で除外済みだが念のため
    return "tile-drop"
  }

  // 他教材は section が無いこともあるので null にして heuristic へ
  if (!sectionId) return null
  return null
}

// -------------------------
// fallback：旧推定（雑でOK：互換用）
// -------------------------
function inferKindByHeuristic(question: string, choices: any[]): GameKind {
  const q = question

  // 漢字・読み・どの漢字 など → speed-choice
  if (/漢字|読み|よみ|ひらがな|カタカナ/.test(q)) return "speed-choice"

  // choicesが短い語彙4択っぽいなら speed-choice を優先
  const c = (choices ?? []).map((x) => String(x ?? "").trim()).filter(Boolean)
  const avgLen = c.length ? c.reduce((s, v) => s + v.length, 0) / c.length : 0
  if (c.length === 4 && avgLen <= 10) return "speed-choice"

  // 助詞/空欄/穴埋め → tile-drop
  if (/助詞/.test(q)) return "tile-drop"
  if (/（\s*）|＿{2,}|_{2,}|〔\s*〕|【\s*】/.test(q)) return "tile-drop"

  return "tile-drop"
}

// -------------------------
// prompt生成
// -------------------------
function buildSpeedChoicePrompt(question: string) {
  const clean = question.replace(/\s+/g, " ").trim()

  // ✅ まず短いならそのまま（文脈を残す）
  if (clean.length <= 42) return clean

  // ✅ 「漢字/読み」系は最優先で文を残す
  if (/漢字|読み|よみ|ひらがな|カタカナ/.test(clean)) {
    // 1文目（。まで）を優先
    const first = clean.split("。")[0].trim()
    if (first && first.length <= 42) return first + "。"

    // 「？」があればそこまで
    const qidx = clean.indexOf("？")
    if (qidx >= 0 && qidx <= 42) return clean.slice(0, qidx + 1)

    // 最後は切ってでも残す
    return clean.slice(0, 41) + "…"
  }

  // ✅ 一般：まず1文目
  const firstSentence = clean.split("。")[0].trim()
  if (firstSentence && firstSentence.length <= 42) return firstSentence + "。"

  // ✅ 「？」があればそこまで
  const qidx = clean.indexOf("？")
  if (qidx >= 0 && qidx <= 42) return clean.slice(0, qidx + 1)

  // ✅ 最後の手段：先頭短縮
  return clean.slice(0, 41) + "…"
}

function buildTileDropPrompt(question: string) {
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

// -------------------------
// choices整形
// -------------------------
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

  if (correct.length <= o.maxChoiceChars) uniq.set(correct, correct)
  else return []

  const all = Array.from(uniq.values()).filter((v) => v !== correct)
  const picked = pickRandom(all, Math.max(0, o.maxChoices - 1))
  const pool = shuffle([correct, ...picked])

  if (pool.length < o.minChoices) {
    const more = all.filter((v) => !pool.includes(v))
    pool.push(...pickRandom(more, o.minChoices - pool.length))
  }

  return shuffle(pool).slice(0, o.maxChoices)
}

// -------------------------
// util
// -------------------------
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