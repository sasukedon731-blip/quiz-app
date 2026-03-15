import { quizCatalog } from "@/app/data/quizCatalog"

export type BadgeRarity = "common" | "rare" | "epic" | "legend"
export type BadgeGroup = "battle" | "study" | "listening" | "industry" | "streak" | "score" | "secret"

export type BadgeDef = {
  id: string
  icon: string
  label: string
  description: string
  howToUnlock: string
  rarity: BadgeRarity
  group: BadgeGroup
  hidden?: boolean
  image?: string
  order: number
}

type UnlockState = {
  totalAnswers?: number
  listeningAnswers?: number
  gamePlays?: number
  attackPlays?: number
  tileDropClears?: number
  flashJudgeClears?: number
  memoryBurstClears?: number
  examClears?: number
  reviewPlays?: number
  maxScore?: number
  streak?: number
  industryCounts?: Partial<Record<"construction" | "manufacturing" | "care" | "driver", number>>
}

export function getPerfectBadgeId(quizType: string) {
  return `perfect-${quizType}`
}

function quizTitle(quizType: string) {
  return quizCatalog.find((q) => q.id === quizType)?.title ?? quizType
}

const BASE_BADGES: BadgeDef[] = [
  {
    id: "battle-first-play",
    icon: "🎮",
    label: "はじめての挑戦",
    description: "日本語バトルに初挑戦",
    howToUnlock: "どれかのゲームを1回プレイ",
    rarity: "common",
    group: "battle",
    order: 1,
  },
  {
    id: "battle-attack-first",
    icon: "🏁",
    label: "アタック挑戦者",
    description: "アタックモードに初挑戦",
    howToUnlock: "どれかのゲームでアタックを1回プレイ",
    rarity: "common",
    group: "battle",
    order: 2,
  },
  {
    id: "study-first-answer",
    icon: "📘",
    label: "はじめの1問",
    description: "最初の1問に挑戦",
    howToUnlock: "通常学習か模擬試験で1問解く",
    rarity: "common",
    group: "study",
    order: 3,
  },
  {
    id: "exam-first-clear",
    icon: "✅",
    label: "模擬デビュー",
    description: "模擬試験を初クリア",
    howToUnlock: "模擬試験を1回完了する",
    rarity: "common",
    group: "study",
    order: 4,
  },
  {
    id: "review-first-play",
    icon: "🔁",
    label: "復習は大事",
    description: "復習モードに初挑戦",
    howToUnlock: "復習モードを1回プレイ",
    rarity: "common",
    group: "study",
    order: 5,
  },
]

const MILESTONES: BadgeDef[] = [
  [10, "📝", "10問突破", "累計10問解く", "common"],
  [100, "📚", "100問突破", "累計100問解く", "rare"],
  [500, "📖", "500問突破", "累計500問解く", "epic"],
  [1000, "🏯", "1000問突破", "累計1000問解く", "legend"],
].map(([n, icon, label, howToUnlock, rarity], i) => ({
  id: `study-questions-${n}`,
  icon: String(icon),
  label: String(label),
  description: `累計${n}問解答達成`,
  howToUnlock: String(howToUnlock),
  rarity: rarity as BadgeRarity,
  group: "study" as BadgeGroup,
  order: 100 + i,
}))

const SCORE_BADGES: BadgeDef[] = [
  [60, "🥉", "60点到達", "どれかの教材で60点以上を取る", "common"],
  [80, "🥈", "80点到達", "どれかの教材で80点以上を取る", "rare"],
  [90, "🥇", "90点到達", "どれかの教材で90点以上を取る", "epic"],
  [100, "💯", "満点ハンター", "どれかの教材で100点を取る", "legend"],
].map(([n, icon, label, howToUnlock, rarity], i) => ({
  id: `score-${n}`,
  icon: String(icon),
  label: String(label),
  description: `初めて${n}点以上を獲得`,
  howToUnlock: String(howToUnlock),
  rarity: rarity as BadgeRarity,
  group: "score" as BadgeGroup,
  order: 200 + i,
}))

const STREAK_BADGES: BadgeDef[] = [
  [3, "🌱", "3日継続", "3日連続で学習する", "common"],
  [7, "🌿", "1週間継続", "7日連続で学習する", "rare"],
  [30, "🌳", "継続の木", "30日連続で学習する", "legend"],
].map(([n, icon, label, howToUnlock, rarity], i) => ({
  id: `streak-${n}`,
  icon: String(icon),
  label: String(label),
  description: `${n}日連続で学習`,
  howToUnlock: String(howToUnlock),
  rarity: rarity as BadgeRarity,
  group: "streak" as BadgeGroup,
  order: 300 + i,
}))

const INDUSTRY_BADGES: BadgeDef[] = [
  ["construction", "🏗️", "建設スタート", "建設系教材を1問以上解く", "common", 1],
  ["construction", "🏗️", "建設マスター", "建設系教材を100問解く", "epic", 100],
  ["manufacturing", "⚙️", "製造スタート", "製造系教材を1問以上解く", "common", 1],
  ["manufacturing", "⚙️", "製造職人", "製造系教材を100問解く", "epic", 100],
  ["care", "💖", "介護スタート", "介護系教材を1問以上解く", "common", 1],
  ["care", "💖", "介護ヒーロー", "介護系教材を100問解く", "epic", 100],
  ["driver", "🚗", "免許スタート", "免許系教材を1問以上解く", "common", 1],
  ["driver", "🚗", "道路の達人", "免許系教材を100問解く", "epic", 100],
].map(([k, icon, label, howToUnlock, rarity, n], i) => ({
  id: `${k}-${n}`,
  icon: String(icon),
  label: String(label),
  description: String(label),
  howToUnlock: String(howToUnlock),
  rarity: rarity as BadgeRarity,
  group: "industry" as BadgeGroup,
  order: 400 + i,
}))

const CATALOG = [...BASE_BADGES, ...MILESTONES, ...SCORE_BADGES, ...STREAK_BADGES, ...INDUSTRY_BADGES].sort((a, b) => a.order - b.order)

function buildPerfectBadgeMeta(badgeId: string): BadgeDef {
  const quizType = badgeId.replace(/^perfect-/, "")
  const title = quizTitle(quizType)
  return {
    id: badgeId,
    icon: "💯",
    label: `${title} 100点`,
    description: `${title} の模擬試験で100点を獲得`,
    howToUnlock: `${title} の模擬試験で100点を取る`,
    rarity: "legend",
    group: "score",
    order: 10000,
  }
}

export function getBadgeMeta(badgeId: string): BadgeDef {
  if (badgeId.startsWith("perfect-")) return buildPerfectBadgeMeta(badgeId)
  return CATALOG.find((b) => b.id === badgeId) ?? {
    id: badgeId,
    icon: "🏅",
    label: badgeId,
    description: "実績バッジ",
    howToUnlock: "条件不明",
    rarity: "common",
    group: "study",
    order: 99999,
  }
}

export function getBadgeLabelFromBadgeId(badgeId: string) {
  return getBadgeMeta(badgeId).label
}

export function getBadgeCatalog(): BadgeDef[] {
  const perfectBadges = quizCatalog
    .filter((q) => q.enabled)
    .map((q, i) => ({ ...buildPerfectBadgeMeta(getPerfectBadgeId(q.id)), order: 20000 + i }))
  return [...CATALOG, ...perfectBadges].sort((a, b) => a.order - b.order)
}

export function getAllBadgeMeta(unlockedBadgeIds: string[]) {
  const unlocked = new Set(unlockedBadgeIds)
  return getBadgeCatalog().map((badge) => ({ ...badge, unlocked: unlocked.has(badge.id) }))
}

export function getUnlockedBadgeCount(unlockedBadgeIds: string[]) {
  return unlockedBadgeIds.length
}

export function getTotalBadgeCount() {
  return getBadgeCatalog().length
}

export function getPreviewBadgeMeta(unlockedBadgeIds: string[], limit = 8) {
  const unlockedSet = new Set(unlockedBadgeIds)
  return getBadgeCatalog().filter((b) => unlockedSet.has(b.id)).slice(0, limit)
}

export function getRarityColors(rarity: BadgeRarity) {
  switch (rarity) {
    case "common":
      return { border: "#d1d5db", bg: "linear-gradient(135deg, #f9fafb 0%, #eef2f7 100%)", glow: "rgba(107,114,128,0.18)" }
    case "rare":
      return { border: "#93c5fd", bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", glow: "rgba(59,130,246,0.20)" }
    case "epic":
      return { border: "#c4b5fd", bg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", glow: "rgba(124,58,237,0.22)" }
    case "legend":
      return { border: "#fcd34d", bg: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)", glow: "rgba(245,158,11,0.22)" }
  }
}

export function getBadgeGroupLabel(group: BadgeGroup) {
  switch (group) {
    case "battle": return "ゲーム"
    case "study": return "学習"
    case "listening": return "リスニング"
    case "industry": return "業種"
    case "streak": return "継続"
    case "score": return "得点"
    case "secret": return "シークレット"
    default: return "その他"
  }
}

export function computeUnlockedBadges(currentBadgeIds: string[], state: UnlockState) {
  const owned = new Set(currentBadgeIds)
  const newly: string[] = []

  const tryAdd = (id: string, ok: boolean) => {
    if (ok && !owned.has(id)) {
      owned.add(id)
      newly.push(id)
    }
  }

  tryAdd("battle-first-play", (state.gamePlays ?? 0) >= 1)
  tryAdd("battle-attack-first", (state.attackPlays ?? 0) >= 1)
  tryAdd("study-first-answer", (state.totalAnswers ?? 0) >= 1)
  tryAdd("exam-first-clear", (state.examClears ?? 0) >= 1)
  tryAdd("review-first-play", (state.reviewPlays ?? 0) >= 1)

  ;[10, 100, 500, 1000].forEach((n) => tryAdd(`study-questions-${n}`, (state.totalAnswers ?? 0) >= n))
  ;[60, 80, 90, 100].forEach((n) => tryAdd(`score-${n}`, (state.maxScore ?? 0) >= n))
  ;[3, 7, 30].forEach((n) => tryAdd(`streak-${n}`, (state.streak ?? 0) >= n))

  ;(["construction", "manufacturing", "care", "driver"] as const).forEach((k) => {
    tryAdd(`${k}-1`, (state.industryCounts?.[k] ?? 0) >= 1)
    tryAdd(`${k}-100`, (state.industryCounts?.[k] ?? 0) >= 100)
  })

  return newly
}
