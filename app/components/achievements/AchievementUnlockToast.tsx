"use client"

import React, { useEffect, useMemo, useState } from "react"

export type BadgeToastItem = {
  id: string
  icon: string
  label: string
  rarity?: "common" | "rare" | "epic" | "legend"
}

function rarityFx(rarity?: BadgeToastItem["rarity"]) {
  switch (rarity) {
    case "rare":
      return { bg: "linear-gradient(135deg,#dbeafe,#eff6ff)", glow: "rgba(59,130,246,0.28)" }
    case "epic":
      return { bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)", glow: "rgba(124,58,237,0.30)" }
    case "legend":
      return { bg: "linear-gradient(135deg,#fef3c7,#fff7ed)", glow: "rgba(245,158,11,0.34)" }
    default:
      return { bg: "linear-gradient(135deg,#eef2f7,#f9fafb)", glow: "rgba(107,114,128,0.22)" }
  }
}

export default function AchievementUnlockToast({
  items,
  onClose,
  durationMs = 2200,
}: {
  items: BadgeToastItem[]
  onClose?: () => void
  durationMs?: number
}) {
  const item = useMemo(() => items[0], [items])
  const [visible, setVisible] = useState(Boolean(item))

  useEffect(() => {
    setVisible(Boolean(item))
    if (!item) return
    const t = window.setTimeout(() => {
      setVisible(false)
      window.setTimeout(() => onClose?.(), 220)
    }, durationMs)
    return () => window.clearTimeout(t)
  }, [item, onClose, durationMs])

  if (!item) return null

  const fx = rarityFx(item.rarity)

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        display: "grid",
        placeItems: "center",
        zIndex: 60,
      }}
    >
      <div
        style={{
          minWidth: 280,
          maxWidth: 360,
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.8)",
          background: fx.bg,
          boxShadow: `0 24px 60px ${fx.glow}`,
          padding: "18px 18px 16px",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(12px)",
          opacity: visible ? 1 : 0,
          transition: "all 220ms ease",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", opacity: 0.7 }}>
          NEW ACHIEVEMENT
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.82)",
              boxShadow: "inset 0 2px 8px rgba(255,255,255,0.75), 0 12px 24px rgba(0,0,0,0.08)",
              fontSize: 34,
            }}
          >
            {item.icon}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.72 }}>🏆 新しい実績</div>
            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 900, lineHeight: 1.25 }}>
              {item.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
