"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"

import AppHeader from "@/app/components/AppHeader"
import { db } from "@/app/lib/firebase"

import styles from "./gameTop.module.css"

type Kind = "tile-drop" | "flash-judge" | "memory-burst"

type LeaderRow = {
  displayName: string
  bestScore: number
}

type GameCard = {
  kind: Kind
  title: string
  desc: string
  tags: string[]
}

const GAMES: GameCard[] = [
  {
    kind: "tile-drop",
    title: "文字ブレイク",
    desc: "落ちてくる問題を、正しい順番でタップして破壊。読み・穴埋め・助詞に強い。",
    tags: ["3ミスで終了", "コンボ", "テンポ"],
  },
  {
    kind: "flash-judge",
    title: "瞬判ジャッジ",
    desc: "文が正しいなら○、間違いなら×。テンポ良く直感で鍛える。",
    tags: ["○×", "反射", "コンボ加点"],
  },
  {
    kind: "memory-burst",
    title: "フラッシュ記憶",
    desc: "一瞬だけ表示 → 記憶して4択。短時間で記憶力を鍛える。",
    tags: ["4択", "短期記憶", "テンポ"],
  },
]

export default function GameTopClient() {
  const [lb, setLb] = useState<Record<Kind, LeaderRow[]>>({
    "tile-drop": [],
    "flash-judge": [],
    "memory-burst": [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadOne(kind: Kind): Promise<LeaderRow[]> {
      const col = collection(db, "attackLeaderboards", kind, "entries")
      const q = query(col, orderBy("bestScore", "desc"), limit(3))
      const snap = await getDocs(q)
      return snap.docs.map((d) => {
        const v: any = d.data()
        return {
          displayName: String(v.displayName ?? "Anonymous"),
          bestScore: Number(v.bestScore ?? 0),
        }
      })
    }

    async function run() {
      try {
        setLoading(true)

        // ✅ ここで型を確定させて readonly を発生させない
        const results: Array<[Kind, LeaderRow[]]> = await Promise.all(
          (GAMES.map((g) => g.kind) as Kind[]).map(async (k) => {
            try {
              const rows = await loadOne(k)
              return [k, rows] as [Kind, LeaderRow[]]
            } catch {
              return [k, [] as LeaderRow[]] as [Kind, LeaderRow[]]
            }
          })
        )

        if (cancelled) return

        const next: Record<Kind, LeaderRow[]> = {
          "tile-drop": [],
          "flash-judge": [],
          "memory-burst": [],
        }

        for (const [k, rows] of results) {
          next[k] = rows
        }

        setLb(next)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const cards = useMemo(() => GAMES, [])

  return (
    <main className={styles.wrap}>
      <AppHeader />

      <section className={styles.head}>
        <h1 className={styles.h1}>ゲーム</h1>
        <p className={styles.lead}>遊びたいゲームを選ぶ → 説明ページでモード/級を選ぶ → プレイ開始。</p>
      </section>

      <section className={styles.cards}>
        {cards.map((c) => {
          const ranks = lb[c.kind] ?? []
          return (
            <div key={c.kind} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardTitle}>{c.title}</div>
                <div className={styles.cardDesc}>{c.desc}</div>

                <div className={styles.tags}>
                  {c.tags.map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className={styles.rankBox}>
                  <div className={styles.rankHead}>ランキング（アタック）</div>
                  {loading ? (
                    <div className={styles.rankEmpty}>読み込み中…</div>
                  ) : ranks.length === 0 ? (
                    <div className={styles.rankEmpty}>まだ記録がありません</div>
                  ) : (
                    <ol className={styles.rankList}>
                      {ranks.map((r, i) => (
                        <li key={`${c.kind}-${i}`} className={styles.rankRow}>
                          <span className={styles.rankNo}>{i + 1}</span>
                          <span className={styles.rankName}>{r.displayName}</span>
                          <span className={styles.rankScore}>{r.bestScore}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                <Link className={`${styles.btn} ${styles.btnMain}`} href={`/game/${c.kind}`}>
                  チャレンジ
                </Link>
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}