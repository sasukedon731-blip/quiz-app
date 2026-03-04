"use client"

import Link from "next/link"
import { useMemo, useState, useEffect } from "react"
import { db } from "@/app/lib/firebase"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"

import type { QuizType } from "@/app/data/types"
import { useAuth } from "@/app/lib/useAuth"

import styles from "./gameKind.module.css"

type Kind = "tile-drop" | "flash-judge" | "memory-burst"
type Mode = "normal" | "attack"

function isKind(v: string): v is Kind {
  return v === "tile-drop" || v === "flash-judge" || v === "memory-burst"
}

function isQuizType(v: any): v is QuizType {
  return (
    v === "japanese-n4" ||
    v === "japanese-n3" ||
    v === "japanese-n2" ||
    v === "gaikoku-license" ||
    v === "genba-listening" ||
    v === "road-signs"
  )
}

function kindMeta(kind: Kind) {
  if (kind === "tile-drop") {
    return {
      title: "文字ブレイク",
      desc: "落ちてくる問題を、正しい順番でタップして破壊。読み・穴埋め・助詞をテンポ良く反復する。",
      rules: [
        "3ミスで終了",
        "コンボで加点",
        "ノーマル：級固定 / アタック：速度UP＋自動昇格",
      ],
    }
  }
  if (kind === "flash-judge") {
    return {
      title: "瞬判ジャッジ",
      desc: "文が正しいなら○、間違いなら×。反射で文法を鍛える。",
      rules: ["3ミスで終了", "○×で回答", "コンボで加点"],
    }
  }
  return {
    title: "フラッシュ記憶",
    desc: "一瞬だけ表示 → 記憶して4択。記憶の瞬発力を鍛える。",
    rules: ["3ミスで終了", "4択", "テンポ重視"],
  }
}

export default function GameKindClient({ kind }: { kind: string }) {
  const router = useRouter()

const [lb, setLb] = useState<{ displayName: string; bestScore: number }[]>([])

useEffect(() => {
  let cancelled = false
  async function run() {
    try {
      const col = collection(db, "attackLeaderboards", safeKind, "entries")
      const q = query(col, orderBy("bestScore", "desc"), limit(10))
      const snap = await getDocs(q)
      const list = snap.docs.map((d) => {
        const v: any = d.data()
        return { displayName: String(v.displayName ?? "Anonymous"), bestScore: Number(v.bestScore ?? 0) }
      })
      if (!cancelled) setLb(list)
    } catch {
      if (!cancelled) setLb([])
    }
  }
  run()
  return () => { cancelled = true }
}, [safeKind])
  const params = useSearchParams()
  const { user } = useAuth()

  const safeKind: Kind = useMemo(() => (isKind(kind) ? kind : "tile-drop"), [kind])
  const meta = useMemo(() => kindMeta(safeKind), [safeKind])

  const rawType = params.get("type")
  const rawMode = params.get("mode")
  const quick = params.get("quick") === "1"

  const [quizType, setQuizType] = useState<QuizType>(() => (isQuizType(rawType) ? rawType : "japanese-n4"))
  const [mode, setMode] = useState<Mode>(() => (rawMode === "attack" ? "attack" : "normal"))
  const [toast, setToast] = useState<string>("")

  // クエリが変わったら同期（戻る/進むやリンク直打ち対応）
  useEffect(() => {
    if (isQuizType(rawType)) setQuizType(rawType)
    setMode(rawMode === "attack" ? "attack" : "normal")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawType, rawMode])

  // quick=1 は「即プレイ」導線（ただし attack はログイン必須）
  useEffect(() => {
    if (!quick) return
    // 1回だけ
    router.replace(`/game/${safeKind}`)
    // 即プレイ
    goPlay(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goPlay(isQuick?: boolean) {
    const wantMode = mode
    if (wantMode === "attack" && !user) {
      setToast("アタック（ランキング）はログインが必要です。ノーマルで開始します。")
      const qs = new URLSearchParams({
        kind: safeKind,
        type: quizType,
        mode: "normal",
        autostart: "1",
      })
      router.push(`/game/play?${qs.toString()}`)
      return
    }

    const qs = new URLSearchParams({
      kind: safeKind,
      type: quizType,
      mode: wantMode,
      autostart: "1",
    })

    if (isQuick) {
      // 将来：ここに lastPlayedKind などを仕込める
    }

    router.push(`/game/play?${qs.toString()}`)
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.topRow}>
        <Link href="/game" className={styles.back}>
          ← ゲームTOP
        </Link>
      </div>

      <div className={styles.title}>{meta.title}</div>
      <div className={styles.desc}>{meta.desc}</div>

      <ul className={styles.ruleList}>
        {meta.rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>


<section className={styles.rankCard}>
  <div className={styles.rankHead}>
    <div className={styles.rankLabel}>ランキング（アタック）</div>
    <div className={styles.rankHint}>※ アタックのベストスコア上位</div>
  </div>
  {lb.length === 0 ? (
    <div className={styles.rankEmpty}>まだ記録がありません</div>
  ) : (
    <ol className={styles.rankList}>
      {lb.slice(0, 5).map((r, i) => (
        <li key={i} className={styles.rankRow}>
          <span className={styles.rankNo}>{i + 1}</span>
          <span className={styles.rankName}>{r.displayName}</span>
          <span className={styles.rankScore}>{r.bestScore}</span>
        </li>
      ))}
    </ol>
  )}
</section>

      <section className={styles.card}>
        <div className={styles.label}>モード</div>
        <div className={styles.seg}>
          <button
            type="button"
            className={`${styles.segBtn} ${mode === "normal" ? styles.segBtnActive : ""}`}
            onClick={() => setMode("normal")}
          >
            ノーマル（学習）
          </button>
          <button
            type="button"
            className={`${styles.segBtn} ${mode === "attack" ? styles.segBtnActive : ""}`}
            onClick={() => {
              if (!user) {
                setToast("アタックはログインが必要です（ノーマル推奨）")
                setMode("normal")
                return
              }
              setMode("attack")
            }}
          >
            アタック（ランキング）
          </button>
        </div>
        <div className={styles.help}>※ アタックはログイン必須。ノーマルはゲストでもOK。</div>

        <div style={{ marginTop: 12 }}>
          <div className={styles.label}>級（教材）</div>
          <div className={styles.seg}>
            {(["japanese-n4", "japanese-n3", "japanese-n2"] as QuizType[]).map((qt) => (
              <button
                key={qt}
                type="button"
                className={`${styles.segBtn} ${quizType === qt ? styles.segBtnActive : ""}`}
                onClick={() => setQuizType(qt)}
              >
                {qt === "japanese-n4" ? "N4" : qt === "japanese-n3" ? "N3" : "N2"}
              </button>
            ))}
          </div>
          <div className={styles.help}>※ いまはN4/N3/N2のみ。将来ここを拡張。</div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.btnMain}`} onClick={() => goPlay()}>
            プレイ開始
          </button>
          <Link className={styles.btn} href="/mypage">
            マイページ
          </Link>
        </div>

        {toast ? <div className={styles.help} style={{ fontWeight: 900 }}>{toast}</div> : null}
      </section>
    </main>
  )
}
