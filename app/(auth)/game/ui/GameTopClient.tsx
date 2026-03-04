"use client"

import Link from "next/link"
import { useMemo } from "react"
import styles from "./gameTop.module.css"

type GameCard = {
  kind: "tile-drop" | "flash-judge" | "memory-burst"
  title: string
  desc: string
  tags: string[]
}

export default function GameTopClient() {
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

            <div className={styles.actions}>
              <Link className={styles.btn} href={`/game/${c.kind}`}>
                説明を見る
              </Link>
              <Link className={`${styles.btn} ${styles.btnMain}`} href={`/game/${c.kind}?quick=1`}>
                すぐ遊ぶ
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
