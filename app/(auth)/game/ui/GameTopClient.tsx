"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import styles from "./gameTop.module.css"

import AppHeader from "@/app/components/AppHeader"
import { db } from "@/app/lib/firebase"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"

type GameCard = {
  kind: "tile-drop" | "flash-judge" | "memory-burst"
  title: string
  desc: string
  tags: string[]
}

export default function GameTopClient() {
  
const [rankings, setRankings] = useState<Record<string, { displayName: string; bestScore: number }[]>>({})

useEffect(() => {
  let cancelled = false
  async function run() {
    try {
      const kinds = ["tile-drop", "flash-judge", "memory-burst"] as const
      const pairs = await Promise.all(
        kinds.map(async (k) => {
          try {
            const col = collection(db, "attackLeaderboards", k, "entries")
            const q = query(col, orderBy("bestScore", "desc"), limit(3))
            const snap = await getDocs(q)
            const list = snap.docs.map((d) => {
              const v: any = d.data()
              return {
                displayName: String(v.displayName ?? "Anonymous"),
                bestScore: Number(v.bestScore ?? 0),
              }
            })
            return [k, list] as const
          } catch {
            return [k, []] as const
          }
        })
      )
      if (cancelled) return
      const next: any = {}
      for (const [k, list] of pairs) next[k] = list
      setRankings(next)
    } catch {
      // ignore
    }
  }
  run()
  return () => {
    cancelled = true
  }
}, [])
const cards: GameCard[] = useMemo(
    () => [
      {
        kind: "tile-drop",
        title: "文字ブレイク",
        desc: "落ちてくる問題を、正しい順番でタップして破壊。読み・穴埋め・助詞に強い。",
        tags: ["3ミスで終了", "コンボ", "タイムストップ"],
      },
      {
        kind: "flash-judge",
        title: "瞬判ジャッジ",
        desc: "文が正しいなら○、間違いなら×。テンポ良く直感で鍛える。",
        tags: ["○×", "反射神経", "コンボ加点"],
      },
      {
        kind: "memory-burst",
        title: "フラッシュ記憶",
        desc: "一瞬だけ表示 → 記憶して4択。短時間で記憶力を鍛える。",
        tags: ["4択", "短期記憶", "テンポ"],
      },
    ],
    []
  )

  return (
    <main className={styles.wrap}>
      <AppHeader title="ゲーム" />
      <div className={styles.header}>
        <div>
          <div className={styles.title}>ゲーム</div>
          <div className={styles.sub}>
            まずは遊びたいゲームを選ぶ → 説明ページでモード/級を選ぶ → プレイ開始。
          </div>
        </div>
      </div>

      <section className={styles.grid}>
        {cards.map((c) => (
          <div key={c.kind} className={styles.card}>
            <div className={styles.cardTitle}>{c.title}</div>
            <div className={styles.cardDesc}>{c.desc}</div>

            <div className={styles.meta}>
              {c.tags.map((t) => (
                <span key={t} className={styles.pill}>
                  {t}
                </span>
              ))}
            </div>

            
<div className={styles.rankBox}>
  <div className={styles.rankTitle}>ランキング（アタック）</div>
  {((rankings[c.kind] ?? []).length === 0) ? (
    <div className={styles.rankEmpty}>まだ記録がありません</div>
  ) : (
    <ol className={styles.rankList}>
      {(rankings[c.kind] ?? []).map((r, i) => (
        <li key={i} className={styles.rankRow}>
          <span className={styles.rankNo}>{i + 1}</span>
          <span className={styles.rankName}>{r.displayName}</span>
          <span className={styles.rankScore}>{r.bestScore}</span>
        </li>
      ))}
    </ol>
  )}
</div>

<div className={styles.actions}>

              <Link className={styles.btn} href={`/game/${c.kind}`}>
                説明を見る
              </Link>
              <Link className={`${styles.btn} ${styles.btnMain}`} href={`/game/${c.kind}?quick=1`}>
                チャレンジ
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
