import { quizCatalog } from "@/app/data/quizCatalog"

export type BadgeRarity = "common" | "rare" | "epic" | "legend"
export type BadgeGroup =
  | "battle"
  | "study"
  | "listening"
  | "industry"
  | "streak"
  | "score"
  | "secret"

export type BadgeDef = {
  id: string
  icon: string
  image?: string
  label: string
  description: string
  howToUnlock: string
  rarity: BadgeRarity
  group: BadgeGroup
  hidden?: boolean
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

type UnlockRule = {
  badgeId: string
  test: (state: UnlockState) => boolean
}

export function getPerfectBadgeId(quizType: string) {
  return `perfect-${quizType}`
}

function quizTitle(quizType: string) {
  return quizCatalog.find((q) => q.id === quizType)?.title ?? quizType
}

function rarityForIndex(index: number, maxIndex: number): BadgeRarity {
  if (index >= maxIndex) return "legend"
  if (index >= Math.max(3, maxIndex - 1)) return "epic"
  if (index >= 2) return "rare"
  return "common"
}

function imagePath(group: BadgeGroup, id: string) {
  return `/badges/generated/${group}-${id}.svg`
}

const BASE_BADGES: BadgeDef[] = [
  {
    id: "battle-first-play",
    icon: "🎮",
    image: imagePath("battle", "battle-first-play"),
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
    image: imagePath("battle", "battle-attack-first"),
    label: "アタック挑戦者",
    description: "アタックモードに初挑戦",
    howToUnlock: "どれかのゲームでアタックを1回プレイ",
    rarity: "common",
    group: "battle",
    order: 2,
  },
  {
    id: "tile-drop-first-clear",
    icon: "🔨",
    image: imagePath("battle", "tile-drop-first-clear"),
    label: "文字ブレイク入門",
    description: "文字ブレイクを初クリア",
    howToUnlock: "文字ブレイクを1回最後までプレイ",
    rarity: "common",
    group: "battle",
    order: 3,
  },
  {
    id: "flash-judge-first-clear",
    icon: "⚡",
    image: imagePath("battle", "flash-judge-first-clear"),
    label: "瞬判スタート",
    description: "瞬判ジャッジを初クリア",
    howToUnlock: "瞬判ジャッジを1回最後までプレイ",
    rarity: "common",
    group: "battle",
    order: 4,
  },
  {
    id: "memory-burst-first-clear",
    icon: "🧠",
    image: imagePath("battle", "memory-burst-first-clear"),
    label: "記憶の扉",
    description: "フラッシュ記憶を初クリア",
    howToUnlock: "フラッシュ記憶を1回最後までプレイ",
    rarity: "common",
    group: "battle",
    order: 5,
  },
  {
    id: "study-first-answer",
    icon: "📘",
    image: imagePath("study", "study-first-answer"),
    label: "はじめの1問",
    description: "最初の1問に挑戦",
    howToUnlock: "通常学習か模擬試験で1問解く",
    rarity: "common",
    group: "study",
    order: 100,
  },
  {
    id: "exam-first-clear",
    icon: "✅",
    image: imagePath("study", "exam-first-clear"),
    label: "模擬デビュー",
    description: "模擬試験を初クリア",
    howToUnlock: "模擬試験を1回完了する",
    rarity: "common",
    group: "study",
    order: 101,
  },
  {
    id: "review-first-play",
    icon: "🔁",
    image: imagePath("study", "review-first-play"),
    label: "復習は大事",
    description: "復習モードに初挑戦",
    howToUnlock: "復習モードを1回プレイ",
    rarity: "common",
    group: "study",
    order: 102,
  },
  {
    id: "listening-first-play",
    icon: "🎧",
    image: imagePath("listening", "listening-first-play"),
    label: "耳ならし",
    description: "リスニング初挑戦",
    howToUnlock: "リスニング教材を1回プレイ",
    rarity: "common",
    group: "listening",
    order: 200,
  },
]

const milestoneGroups = {
  battle: {
    prefix: "battle-play",
    icon: "🔥",
    label: "バトル",
    description: "ゲームプレイ達成",
    unlockLabel: "ゲームを合計{n}回プレイ",
    values: [10, 25, 50, 100, 250, 500],
    group: "battle" as BadgeGroup,
  },
  study: {
    prefix: "study-questions",
    icon: "📚",
    label: "学習",
    description: "累計回答達成",
    unlockLabel: "累計{n}問解く",
    values: [10, 30, 50, 100, 250, 500, 1000, 3000],
    group: "study" as BadgeGroup,
  },
  listening: {
    prefix: "listening-clear",
    icon: "🎙️",
    label: "リスニング",
    description: "聞き取り達成",
    unlockLabel: "リスニング問題を累計{n}問解く",
    values: [10, 30, 50, 100, 300, 500],
    group: "listening" as BadgeGroup,
  },
  streak: {
    prefix: "streak",
    icon: "🌱",
    label: "継続",
    description: "連続学習達成",
    unlockLabel: "{n}日連続で学習する",
    values: [3, 7, 14, 30, 60, 100, 365],
    group: "streak" as BadgeGroup,
  },
  score: {
    prefix: "score",
    icon: "🥇",
    label: "高得点",
    description: "高得点達成",
    unlockLabel: "どれかの教材で{n}点以上を取る",
    values: [60, 70, 80, 90, 95, 100],
    group: "score" as BadgeGroup,
  },
} as const

const industries = [
  { key: "construction", label: "建設", icon: "🏗️" },
  { key: "manufacturing", label: "製造", icon: "⚙️" },
  { key: "care", label: "介護", icon: "💖" },
  { key: "driver", label: "免許", icon: "🚗" },
] as const

function buildMilestoneBadges(): BadgeDef[] {
  const out: BadgeDef[] = []
  let order = 1000

  for (const key of Object.keys(milestoneGroups) as Array<keyof typeof milestoneGroups>) {
    const cfg = milestoneGroups[key]
    cfg.values.forEach((n, idx) => {
      out.push({
        id: `${cfg.prefix}-${n}`,
        icon: cfg.icon,
        image: imagePath(cfg.group, `${cfg.prefix}-${n}`),
        label: `${cfg.label} ${n}`,
        description: `${cfg.description} ${n}`,
        howToUnlock: cfg.unlockLabel.replace("{n}", String(n)),
        rarity: rarityForIndex(idx, cfg.values.length - 1),
        group: cfg.group,
        order: order++,
      })
    })
  }

  industries.forEach((ind, industryIndex) => {
    const values = [1, 10, 30, 50, 100, 300, 500]
    values.forEach((n, idx) => {
      out.push({
        id: `${ind.key}-${n}`,
        icon: ind.icon,
        image: imagePath("industry", `${ind.key}-${n}`),
        label: `${ind.label} ${n}`,
        description: `${ind.label}教材の累計回答 ${n}`,
        howToUnlock: `${ind.label}系教材を累計${n}問解く`,
        rarity: rarityForIndex(idx, values.length - 1),
        group: "industry",
        order: 2000 + industryIndex * 50 + idx,
      })
    })
  })

  const gameModeMilestones = [
    { prefix: "tile-drop-clear", label: "文字ブレイク", icon: "🔨", values: [1, 5, 10, 30, 50, 100] },
    { prefix: "flash-judge-clear", label: "瞬判ジャッジ", icon: "⚡", values: [1, 5, 10, 30, 50, 100] },
    { prefix: "memory-burst-clear", label: "フラッシュ記憶", icon: "🧠", values: [1, 5, 10, 30, 50, 100] },
    { prefix: "attack-play", label: "アタック", icon: "🏁", values: [1, 5, 10, 30, 50, 100] },
  ] as const

  gameModeMilestones.forEach((cfg, outerIdx) => {
    cfg.values.forEach((n, idx) => {
      out.push({
        id: `${cfg.prefix}-${n}`,
        icon: cfg.icon,
        image: imagePath("battle", `${cfg.prefix}-${n}`),
        label: `${cfg.label} ${n}`,
        description: `${cfg.label}の挑戦・達成 ${n}`,
        howToUnlock: `${cfg.label}を合計${n}回達成する`,
        rarity: rarityForIndex(idx, cfg.values.length - 1),
        group: "battle",
        order: 3000 + outerIdx * 50 + idx,
      })
    })
  })

  return out
}

function buildPerfectBadgeMeta(badgeId: string): BadgeDef {
  const quizType = badgeId.replace(/^perfect-/, "")
  const title = quizTitle(quizType)
  return {
    id: badgeId,
    icon: "💯",
    image: imagePath("score", badgeId),
    label: `${title} 100点`,
    description: `${title} の模擬試験で100点を獲得`,
    howToUnlock: `${title} の模擬試験で100点を取る`,
    rarity: "legend",
    group: "score",
    order: 10000,
  }
}

const CATALOG_CACHE = [...BASE_BADGES, ...buildMilestoneBadges()].sort((a, b) => a.order - b.order)

export function getBadgeMeta(badgeId: string): BadgeDef {
  if (badgeId.startsWith("perfect-")) return buildPerfectBadgeMeta(badgeId)
  return CATALOG_CACHE.find((b) => b.id === badgeId) ?? {
    id: badgeId,
    icon: "🏅",
    image: imagePath("study", badgeId),
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

  return [...CATALOG_CACHE, ...perfectBadges].sort((a, b) => a.order - b.order)
}

export function getAllBadgeMeta(unlockedBadgeIds: string[]) {
  const unlocked = new Set(unlockedBadgeIds)
  return getBadgeCatalog().map((badge) => ({
    ...badge,
    unlocked: unlocked.has(badge.id),
  }))
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
      return {
        border: "#d1d5db",
        bg: "linear-gradient(135deg, #f9fafb 0%, #eef2f7 100%)",
        glow: "rgba(107,114,128,0.18)",
      }
    case "rare":
      return {
        border: "#93c5fd",
        bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        glow: "rgba(59,130,246,0.20)",
      }
    case "epic":
      return {
        border: "#c4b5fd",
        bg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
        glow: "rgba(124,58,237,0.22)",
      }
    case "legend":
      return {
        border: "#fcd34d",
        bg: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
        glow: "rgba(245,158,11,0.22)",
      }
  }
}

export function getBadgeGroupLabel(group: BadgeGroup) {
  switch (group) {
    case "battle":
      return "ゲーム"
    case "study":
      return "学習"
    case "listening":
      return "リスニング"
    case "industry":
      return "業種"
    case "streak":
      return "継続"
    case "score":
      return "得点"
    case "secret":
      return "シークレット"
    default:
      return "その他"
  }
}

const unlockRules: UnlockRule[] = [
  { badgeId: "battle-first-play", test: (s) => (s.gamePlays ?? 0) >= 1 },
  { badgeId: "battle-attack-first", test: (s) => (s.attackPlays ?? 0) >= 1 },
  { badgeId: "tile-drop-first-clear", test: (s) => (s.tileDropClears ?? 0) >= 1 },
  { badgeId: "flash-judge-first-clear", test: (s) => (s.flashJudgeClears ?? 0) >= 1 },
  { badgeId: "memory-burst-first-clear", test: (s) => (s.memoryBurstClears ?? 0) >= 1 },
  { badgeId: "study-first-answer", test: (s) => (s.totalAnswers ?? 0) >= 1 },
  { badgeId: "exam-first-clear", test: (s) => (s.examClears ?? 0) >= 1 },
  { badgeId: "review-first-play", test: (s) => (s.reviewPlays ?? 0) >= 1 },
  { badgeId: "listening-first-play", test: (s) => (s.listeningAnswers ?? 0) >= 1 },
]

Object.keys(milestoneGroups).forEach((groupKey) => {
  const cfg = (milestoneGroups as any)[groupKey]
  cfg.values.forEach((n: number) => {
    unlockRules.push({
      badgeId: `${cfg.prefix}-${n}`,
      test: (s) => {
        if (cfg.prefix === "battle-play") return (s.gamePlays ?? 0) >= n
        if (cfg.prefix === "study-questions") return (s.totalAnswers ?? 0) >= n
        if (cfg.prefix === "listening-clear") return (s.listeningAnswers ?? 0) >= n
        if (cfg.prefix === "streak") return (s.streak ?? 0) >= n
        if (cfg.prefix === "score") return (s.maxScore ?? 0) >= n
        return false
      },
    })
  })
})

industries.forEach((ind) => {
  ;[1, 10, 30, 50, 100, 300, 500].forEach((n) => {
    unlockRules.push({
      badgeId: `${ind.key}-${n}`,
      test: (s) => (s.industryCounts?.[ind.key] ?? 0) >= n,
    })
  })
})

;[
  ["tile-drop-clear", "tileDropClears"],
  ["flash-judge-clear", "flashJudgeClears"],
  ["memory-burst-clear", "memoryBurstClears"],
  ["attack-play", "attackPlays"],
].forEach(([prefix, key]) => {
  ;[1, 5, 10, 30, 50, 100].forEach((n) => {
    unlockRules.push({
      badgeId: `${prefix}-${n}`,
      test: (s) => ((s as any)[key] ?? 0) >= n,
    })
  })
})

export function computeUnlockedBadges(currentBadgeIds: string[], state: UnlockState) {
  const owned = new Set(currentBadgeIds)
  const newlyUnlocked: string[] = []

  for (const rule of unlockRules) {
    if (!owned.has(rule.badgeId) && rule.test(state)) {
      owned.add(rule.badgeId)
      newlyUnlocked.push(rule.badgeId)
    }
  }

  return newlyUnlocked
}
