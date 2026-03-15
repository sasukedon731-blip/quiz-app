"use client"

import React, { useMemo, useState } from "react"
import AchievementUnlockToast, { type BadgeToastItem } from "./AchievementUnlockToast"

export default function AchievementUnlockLayer({
  initialItems = [],
}: {
  initialItems?: BadgeToastItem[]
}) {
  const [queue, setQueue] = useState<BadgeToastItem[]>(initialItems)
  const head = useMemo(() => (queue.length ? [queue[0]] : []), [queue])

  return (
    <AchievementUnlockToast
      items={head}
      onClose={() => setQueue((prev) => prev.slice(1))}
    />
  )
}
