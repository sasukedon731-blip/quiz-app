"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/app/lib/firebase"
import { quizCatalog } from "@/app/data/quizCatalog"
import Button from "@/app/components/Button"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [openIndustryId, setOpenIndustryId] = useState<string | null>("construction")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const cta = () => {
    if (user) {
      router.push("/select-mode")
    } else {
      router.push("/login")
    }
  }

  // 🔹 日本語基礎（全業種共通）
  const JAPANESE_BASE_IDS = ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice"]

  const INDUSTRIES = [
    {
      id: "construction",
      icon: "👷",
      title: "建設で働く方へ",
      subtitle: "現場日本語・安全・施工管理",
      extraQuizIds: ["genba-listening", "genba-phrasebook", "kenchiku-sekou-2kyu-1ji"],
    },
    {
      id: "manufacturing",
      icon: "🏭",
      title: "製造で働く方へ",
      subtitle: "工場用語・安全指示",
      extraQuizIds: ["genba-listening", "genba-phrasebook"],
    },
    {
      id: "care",
      icon: "👵",
      title: "介護で働く方へ",
      subtitle: "介護会話・現場日本語",
      extraQuizIds: [],
    },
    {
      id: "driver",
      icon: "🚗",
      title: "運転・免許が必要な方へ",
      subtitle: "外国免許切替・交通ルール",
      extraQuizIds: ["gaikoku-license"],
    },
    {
      id: "undecided",
      icon: "🌱",
      title: "まだ決まっていない方へ",
      subtitle: "まずは日本語基礎から始めましょう",
      extraQuizIds: [],
    },
  ]

  return (
    <main style={styles.main}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.h1}>日本語バトル（1日1回無料）</h1>
        <p style={styles.heroText}>
          日本で働くための日本語・資格をゲーム感覚で学習。
        </p>
        <Button variant="main" onClick={cta}>
          {user ? "学習を始める" : "ログインして始める"}
        </Button>
      </section>

      {/* 業種別セクション */}
      <section style={styles.section}>
        <h2 style={styles.h2}>業種別で探す</h2>
        <p style={styles.subText}>
          日本語基礎（JLPT・スピーキング）は全業種に含まれます。
        </p>

        <div style={styles.industryList}>
          {INDUSTRIES.map((ind) => {
            const base = quizCatalog.filter(
              (q) => q.enabled && JAPANESE_BASE_IDS.includes(q.id)
            )
            const extra = quizCatalog.filter(
              (q) => q.enabled && ind.extraQuizIds.includes(q.id)
            )

            const items = [...base, ...extra].sort(
              (a, b) => (a.order ?? 999) - (b.order ?? 999)
            )

            const isOpen = openIndustryId === ind.id

            return (
              <div key={ind.id} style={styles.card}>
                <button
                  style={styles.cardHeader}
                  onClick={() =>
                    setOpenIndustryId(isOpen ? null : ind.id)
                  }
                >
                  <div style={styles.cardHeaderLeft}>
                    <div style={styles.icon}>{ind.icon}</div>
                    <div>
                      <div style={styles.cardTitle}>{ind.title}</div>
                      <div style={styles.cardSub}>{ind.subtitle}</div>
                    </div>
                  </div>
                  <div style={styles.plus}>{isOpen ? "−" : "+"}</div>
                </button>

                {isOpen && (
                  <div style={styles.cardBody}>
                    <div style={styles.grid}>
                      {items.map((q) => (
                        <div
                          key={q.id}
                          style={styles.item}
                          onClick={() =>
                            router.push(`/contents/${q.id}`)
                          }
                        >
                          <div style={styles.itemTitle}>
                            {q.title}
                          </div>
                          <div style={styles.itemDesc}>
                            {q.description}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Button variant="main" onClick={cta}>
                        この業種で学習を始める
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

const styles: any = {
  main: { padding: 20, maxWidth: 900, margin: "0 auto" },

  hero: {
    textAlign: "center",
    padding: "40px 20px",
    background: "#111827",
    color: "#fff",
    borderRadius: 20,
    marginBottom: 40,
  },

  h1: { fontSize: 28, fontWeight: 900, marginBottom: 10 },
  heroText: { opacity: 0.85, marginBottom: 20 },

  section: { marginBottom: 60 },
  h2: { fontSize: 22, fontWeight: 900, marginBottom: 8 },
  subText: { fontSize: 14, opacity: 0.7, marginBottom: 20 },

  industryList: { display: "flex", flexDirection: "column", gap: 12 },

  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },

  cardHeader: {
    width: "100%",
    padding: 16,
    border: "none",
    background: "transparent",
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer",
  },

  cardHeaderLeft: { display: "flex", gap: 12, alignItems: "center" },

  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "#111827",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: 20,
  },

  cardTitle: { fontWeight: 900 },
  cardSub: { fontSize: 12, opacity: 0.7 },
  plus: { fontSize: 22, fontWeight: 900 },

  cardBody: {
    padding: 16,
    background: "#f9fafb",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 10,
  },

  item: {
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    cursor: "pointer",
    border: "1px solid #e5e7eb",
  },

  itemTitle: { fontWeight: 700, marginBottom: 6 },
  itemDesc: { fontSize: 12, opacity: 0.7 },
}