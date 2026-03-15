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
  label: string
  description: string
  howToUnlock: string
  rarity: BadgeRarity
  group: BadgeGroup
  hidden?: boolean
  order: number
}

export function getPerfectBadgeId(quizType: string) {
  return `perfect-${quizType}`
}
export function getBadgeLabelFromBadgeId(badgeId: string) {
  return getBadgeMeta(badgeId).label
}

function getPerfectBadgeLabel(badgeId: string) {
  const quizType = badgeId.replace(/^perfect-/, "")
  const hit = quizCatalog.find((q) => q.id === quizType)
  const title = hit?.title ?? quizType
  return `${title} 100点`
}

function getPerfectBadgeDescription(badgeId: string) {
  const quizType = badgeId.replace(/^perfect-/, "")
  const hit = quizCatalog.find((q) => q.id === quizType)
  const title = hit?.title ?? quizType
  return `${title} の模擬試験で100点を獲得`
}

const STATIC_BADGES: BadgeDef[] = [
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
    id: "battle-10-play",
    icon: "🕹️",
    label: "バトル常連",
    description: "ゲームプレイ10回達成",
    howToUnlock: "ゲームを合計10回プレイ",
    rarity: "common",
    group: "battle",
    order: 2,
  },
  {
    id: "battle-50-play",
    icon: "🔥",
    label: "熱血プレイヤー",
    description: "ゲームプレイ50回達成",
    howToUnlock: "ゲームを合計50回プレイ",
    rarity: "rare",
    group: "battle",
    order: 3,
  },
  {
    id: "tile-drop-first-clear",
    icon: "🔨",
    label: "文字ブレイク入門",
    description: "文字ブレイクを初クリア",
    howToUnlock: "文字ブレイクを1回最後までプレイ",
    rarity: "common",
    group: "battle",
    order: 4,
  },
  {
    id: "flash-judge-first-clear",
    icon: "⚡",
    label: "瞬判スタート",
    description: "瞬判ジャッジを初クリア",
    howToUnlock: "瞬判ジャッジを1回最後までプレイ",
    rarity: "common",
    group: "battle",
    order: 5,
  },
  {
    id: "memory-burst-first-clear",
    icon: "🧠",
    label: "記憶の扉",
    description: "フラッシュ記憶を初クリア",
    howToUnlock: "フラッシュ記憶を1回最後までプレイ",
    rarity: "common",
    group: "battle",
    order: 6,
  },
  {
    id: "battle-attack-first",
    icon: "🏁",
    label: "アタック挑戦者",
    description: "アタックモードに初挑戦",
    howToUnlock: "どれかのゲームでアタックを1回プレイ",
    rarity: "common",
    group: "battle",
    order: 7,
  },
  {
    id: "battle-rank-in",
    icon: "🏆",
    label: "ランキング入り",
    description: "ランキングに初めて入った",
    howToUnlock: "どれかのゲームでランキング圏内に入る",
    rarity: "epic",
    group: "battle",
    order: 8,
  },

  {
    id: "study-first-answer",
    icon: "📘",
    label: "はじめの1問",
    description: "最初の1問に挑戦",
    howToUnlock: "通常学習か模擬試験で1問解く",
    rarity: "common",
    group: "study",
    order: 20,
  },
  {
    id: "study-10-questions",
    icon: "📝",
    label: "10問突破",
    description: "10問解答達成",
    howToUnlock: "累計10問解く",
    rarity: "common",
    group: "study",
    order: 21,
  },
  {
    id: "study-100-questions",
    icon: "📚",
    label: "100問突破",
    description: "100問解答達成",
    howToUnlock: "累計100問解く",
    rarity: "rare",
    group: "study",
    order: 22,
  },
  {
    id: "study-500-questions",
    icon: "📖",
    label: "500問突破",
    description: "500問解答達成",
    howToUnlock: "累計500問解く",
    rarity: "epic",
    group: "study",
    order: 23,
  },
  {
    id: "study-1000-questions",
    icon: "🏯",
    label: "千問の塔",
    description: "1000問解答達成",
    howToUnlock: "累計1000問解く",
    rarity: "legend",
    group: "study",
    order: 24,
  },
  {
    id: "exam-first-clear",
    icon: "✅",
    label: "模擬デビュー",
    description: "模擬試験を初クリア",
    howToUnlock: "模擬試験を1回完了する",
    rarity: "common",
    group: "study",
    order: 25,
  },
  {
    id: "review-first-play",
    icon: "🔁",
    label: "復習は大事",
    description: "復習モードに初挑戦",
    howToUnlock: "復習モードを1回プレイ",
    rarity: "common",
    group: "study",
    order: 26,
  },

  {
    id: "listening-first-play",
    icon: "🎧",
    label: "耳ならし",
    description: "リスニング初挑戦",
    howToUnlock: "リスニング教材を1回プレイ",
    rarity: "common",
    group: "listening",
    order: 40,
  },
  {
    id: "listening-10-clear",
    icon: "🔊",
    label: "聞き取り初級",
    description: "リスニング10問達成",
    howToUnlock: "リスニング問題を累計10問解く",
    rarity: "common",
    group: "listening",
    order: 41,
  },
  {
    id: "listening-100-clear",
    icon: "🎙️",
    label: "耳の達人",
    description: "リスニング100問達成",
    howToUnlock: "リスニング問題を累計100問解く",
    rarity: "epic",
    group: "listening",
    order: 42,
  },
  {
    id: "dialect-first-clear",
    icon: "🗾",
    label: "方言ハンター",
    description: "方言教材を初クリア",
    howToUnlock: "方言教材を1回完了する",
    rarity: "rare",
    group: "listening",
    order: 43,
  },

  {
    id: "construction-first-clear",
    icon: "👷",
    label: "建設スタート",
    description: "建設教材に初挑戦",
    howToUnlock: "建設系教材を1回完了する",
    rarity: "common",
    group: "industry",
    order: 60,
  },
  {
    id: "construction-100",
    icon: "🏗️",
    label: "建設マスター",
    description: "建設100問達成",
    howToUnlock: "建設系教材を累計100問解く",
    rarity: "epic",
    group: "industry",
    order: 61,
  },
  {
    id: "manufacturing-first-clear",
    icon: "🏭",
    label: "製造スタート",
    description: "製造教材に初挑戦",
    howToUnlock: "製造系教材を1回完了する",
    rarity: "common",
    group: "industry",
    order: 62,
  },
  {
    id: "manufacturing-100",
    icon: "⚙️",
    label: "製造職人",
    description: "製造100問達成",
    howToUnlock: "製造系教材を累計100問解く",
    rarity: "epic",
    group: "industry",
    order: 63,
  },
  {
    id: "care-first-clear",
    icon: "🩺",
    label: "介護スタート",
    description: "介護教材に初挑戦",
    howToUnlock: "介護系教材を1回完了する",
    rarity: "common",
    group: "industry",
    order: 64,
  },
  {
    id: "care-100",
    icon: "💖",
    label: "介護ヒーロー",
    description: "介護100問達成",
    howToUnlock: "介護系教材を累計100問解く",
    rarity: "epic",
    group: "industry",
    order: 65,
  },
  {
    id: "driver-first-clear",
    icon: "🚗",
    label: "免許スタート",
    description: "運転・免許教材に初挑戦",
    howToUnlock: "運転・免許系教材を1回完了する",
    rarity: "common",
    group: "industry",
    order: 66,
  },
  {
    id: "driver-100",
    icon: "🛣️",
    label: "道路の達人",
    description: "運転・免許100問達成",
    howToUnlock: "運転・免許系教材を累計100問解く",
    rarity: "epic",
    group: "industry",
    order: 67,
  },

  {
    id: "streak-3",
    icon: "🌱",
    label: "3日継続",
    description: "3日連続で学習",
    howToUnlock: "3日連続で何かしら学習する",
    rarity: "common",
    group: "streak",
    order: 80,
  },
  {
    id: "streak-7",
    icon: "🌿",
    label: "1週間継続",
    description: "7日連続で学習",
    howToUnlock: "7日連続で何かしら学習する",
    rarity: "rare",
    group: "streak",
    order: 81,
  },
  {
    id: "streak-30",
    icon: "🌳",
    label: "継続の木",
    description: "30日連続で学習",
    howToUnlock: "30日連続で何かしら学習する",
    rarity: "legend",
    group: "streak",
    order: 82,
  },

  {
    id: "score-80",
    icon: "🥉",
    label: "80点到達",
    description: "初めて80点以上を獲得",
    howToUnlock: "どれかの教材で80点以上を取る",
    rarity: "common",
    group: "score",
    order: 100,
  },
  {
    id: "score-90",
    icon: "🥈",
    label: "90点到達",
    description: "初めて90点以上を獲得",
    howToUnlock: "どれかの教材で90点以上を取る",
    rarity: "rare",
    group: "score",
    order: 101,
  },
  {
    id: "score-100",
    icon: "🥇",
    label: "満点ハンター",
    description: "初めて100点を獲得",
    howToUnlock: "どれかの教材で100点を取る",
    rarity: "epic",
    group: "score",
    order: 102,
  },

  {
    id: "secret-night-owl",
    icon: "🌙",
    label: "夜の学習者",
    description: "深夜に学習した者だけが得るバッジ",
    howToUnlock: "深夜0:00〜4:59に学習する",
    rarity: "rare",
    group: "secret",
    hidden: true,
    order: 120,
  },
  {
    id: "secret-early-bird",
    icon: "🌅",
    label: "朝の覚醒者",
    description: "朝活でつかむ実績",
    howToUnlock: "朝5:00〜7:59に学習する",
    rarity: "rare",
    group: "secret",
    hidden: true,
    order: 121,
  },
  {
    id: "secret-perfectionist",
    icon: "👑",
    label: "完璧主義者",
    description: "高難度の条件を達成",
    howToUnlock: "複数教材で満点を取る",
    rarity: "legend",
    group: "secret",
    hidden: true,
    order: 122,
  },
]

function buildPerfectBadgeMeta(badgeId: string): BadgeDef {
  return {
    id: badgeId,
    icon: "💯",
    label: getPerfectBadgeLabel(badgeId),
    description: getPerfectBadgeDescription(badgeId),
    howToUnlock: getPerfectBadgeDescription(badgeId),
    rarity: "legend",
    group: "score",
    order: 10000,
  }
}

export function getBadgeMeta(badgeId: string): BadgeDef {
  if (badgeId.startsWith("perfect-")) {
    return buildPerfectBadgeMeta(badgeId)
  }

  return (
    STATIC_BADGES.find((b) => b.id === badgeId) ?? {
      id: badgeId,
      icon: "🏅",
      label: badgeId,
      description: "実績バッジ",
      howToUnlock: "条件不明",
      rarity: "common",
      group: "study",
      order: 99999,
    }
  )
}

export function getBadgeCatalog(): BadgeDef[] {
  const perfectBadges = quizCatalog
    .filter((q) => q.enabled)
    .map((q, i) => {
      const id = getPerfectBadgeId(q.id)
      return {
        ...buildPerfectBadgeMeta(id),
        order: 20000 + i,
      }
    })

  return [...STATIC_BADGES, ...perfectBadges].sort((a, b) => a.order - b.order)
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