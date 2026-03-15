"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

import { auth, db } from "@/app/lib/firebase"
import {
  getAllBadgeMeta,
  getBadgeGroupLabel,
  getRarityColors,
  getTotalBadgeCount,
  getUnlockedBadgeCount,
} from "@/app/lib/badges"

type BadgeView = ReturnType<typeof getAllBadgeMeta>[number]

export default function AchievementsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [badgeIds, setBadgeIds] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>("all")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login")
        return
      }
      setUser(u)

      try {
        const ref = doc(db, "users", u.uid)
        const snap = await getDoc(ref)
        const data = snap.exists() ? (snap.data() as any) : {}
        const list = Array.isArray(data?.badges)
          ? data.badges.filter((x: any) => typeof x === "string")
          : []
        setBadgeIds(list)
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [router])

  const badges = useMemo(() => getAllBadgeMeta(badgeIds), [badgeIds])

  const groups = useMemo(() => {
    const set = new Set(badges.map((b) => b.group))
    return ["all", ...Array.from(set)]
  }, [badges])

  const filtered = useMemo(() => {
    if (selectedGroup === "all") return badges
    return badges.filter((b) => b.group === selectedGroup)
  }, [badges, selectedGroup])

  if (loading) {
    return (
      <main style={S.page}>
        <div style={S.wrap}>
          <section style={S.card}>読み込み中...</section>
        </div>
      </main>
    )
  }

  return (
    <main style={S.page}>
      <div style={S.wrap}>
        <header style={S.header}>
          <div>
            <div style={S.title}>🏅 実績一覧</div>
            <div style={S.sub}>
              獲得 {getUnlockedBadgeCount(badgeIds)} / {getTotalBadgeCount()}
            </div>
          </div>

          <Link href="/mypage" style={S.backBtn}>
            ← マイページ
          </Link>
        </header>

        <section style={S.card}>
          <div style={S.filterRow}>
            {groups.map((g) => {
              const active = selectedGroup === g
              const label = g === "all" ? "すべて" : getBadgeGroupLabel(g as any)
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroup(g)}
                  style={{
                    ...S.filterBtn,
                    background: active ? "#111827" : "#fff",
                    color: active ? "#fff" : "#111",
                    borderColor: active ? "#111827" : "#e5e7eb",
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div style={S.grid}>
            {filtered.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function BadgeCard({ badge }: { badge: BadgeView }) {
  const c = getRarityColors(badge.rarity)
  const isLocked = !badge.unlocked

  return (
    <div
      style={{
        ...S.badgeCard,
        border: `1px solid ${c.border}`,
        background: c.bg,
        boxShadow: `0 12px 24px ${c.glow}`,
        opacity: isLocked ? 0.82 : 1,
      }}
    >
      <div
        style={{
          ...S.badgeIconWrap,
          filter: isLocked ? "grayscale(1) brightness(0.72)" : "none",
          background: isLocked
            ? "linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)"
            : "rgba(255,255,255,0.68)",
        }}
      >
        <div style={S.badgeIcon}>{isLocked ? "◼" : badge.icon}</div>
      </div>

      <div style={S.badgeBody}>
        <div style={S.badgeTopRow}>
          <span style={S.badgeTitle}>
            {isLocked && badge.hidden ? "？？？？？" : badge.label}
          </span>
          <span style={S.badgeState(isLocked)}>
            {isLocked ? "未獲得" : "獲得済み"}
          </span>
        </div>

        <div style={S.badgeDesc}>
          {isLocked && badge.hidden
            ? "条件不明のシークレットバッジ"
            : badge.description}
        </div>

        <div style={S.badgeHowTo}>
          条件：
          {isLocked && badge.hidden ? "？？？" : badge.howToUnlock}
        </div>
      </div>
    </div>
  )
}

const S: Record<string, any> = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: 18,
  },
  wrap: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 24,
    fontWeight: 900,
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.75,
    fontWeight: 700,
  },
  backBtn: {
    textDecoration: "none",
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 900,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },
  filterRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  filterBtn: {
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  badgeCard: {
    borderRadius: 20,
    padding: 14,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  badgeIconWrap: {
    width: 72,
    height: 72,
    minWidth: 72,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,0.65)",
  },
  badgeIcon: {
    fontSize: 34,
    lineHeight: 1,
  },
  badgeBody: {
    minWidth: 0,
    flex: 1,
  },
  badgeTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  badgeTitle: {
    fontWeight: 900,
    fontSize: 16,
  },
  badgeState: (locked: boolean) => ({
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: locked ? "rgba(15,23,42,0.08)" : "#111827",
    color: locked ? "#475569" : "#fff",
    whiteSpace: "nowrap",
  }),
  badgeDesc: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 1.6,
    opacity: 0.86,
  },
  badgeHowTo: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 1.6,
    fontWeight: 800,
    opacity: 0.78,
  },
}