import { quizCatalog } from "@/app/data/quizCatalog"

export function getPerfectBadgeId(quizType: string) {
  return `perfect-${quizType}`
}

export function getBadgeLabelFromBadgeId(badgeId: string) {
  if (badgeId.startsWith("perfect-")) {
    const quizType = badgeId.replace(/^perfect-/, "")
    const hit = quizCatalog.find((q) => q.id === quizType)
    const title = hit?.title ?? quizType
    return `${title} 100点`
  }
  return badgeId
}

export function getBadgeMeta(badgeId: string) {
  return {
    id: badgeId,
    icon: "🏅",
    label: getBadgeLabelFromBadgeId(badgeId),
  }
}
