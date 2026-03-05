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

// ✅ kind を「正規化」してから判定（ここが本丸）
function normalizeKind(v: unknown): string {
  const s = String(v ?? "")
  let t = s
  try {
    t = decodeURIComponent(s)
  } catch {
    // ignore
  }
  // 念のため ? や # が混ざっても切り落とす（事故耐性）
  t = t.split("?")[0].split("#")[0]
  return t.trim().toLowerCase()
}

function isKind(v: unknown): v is Kind {
  const k = normalizeKind(v)
  return k === "tile-drop" || k === "flash-judge" || k === "memory-burst"
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
      rules: ["3ミスで終了", "コンボで加点", "ノーマル：級固定 / アタック：速度UP＋自動昇格"],
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
  const params = useSearchParams()
  const { user } = useAuth()

  // ✅ 正規化 → 判定 → safeKind
  const safeKind: Kind = useMemo(() => {
    const k = normalizeKind(kind)

    if (k === "tile-drop" || k === "flash-judge" || k === "memory-burst") return k

    // 互換（昔の表記が来ても救う）
    if (k === "flashjudge") return "flash-judge"
    if (k === "memoryburst") return "memory-burst"

    return "tile-drop"
  }, [kind])

  const meta = useMemo(() => kindMeta(safeKind), [safeKind])

  const rawType = params.get("type")
  const rawMode = params.get("mode")
  const quick = params.get("quick") === "1"

  const [quizType, setQuizType] = useState<QuizType>(() => (isQuizType(rawType) ? rawType : "japanese-n4"))
  const [mode, setMode] = useState<Mode>(() => (rawMode === "attack" ? "attack" : "normal"))
  const [toast, setToast] = useState<string>("")

  const [lb, setLb] = useState<{ displayName: string; bestScore: number }[]>([])

  // ✅ ランキング取得（safeKind 依存）
  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const col = collection(db, "attackLeaderboards", safeKind, "entries")
        const q = query(col, orderBy("bestScore", "desc"), limit(10))
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => {
          const v: any = d.data()
          return {
            displayName: String(v.displayName ?? "Anonymous"),
            bestScore: Number(v.bestScore ?? 0),
          }
        })
        if (!cancelled) setLb(list)
      } catch {
        if (!cancelled) setLb([])
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [safeKind])

  // クエリが変わったら同期（戻る/進むやリンク直打ち対応）
  useEffect(() => {
    if (isQuizType(rawType)) setQuizType(rawType)
    setMode(rawMode === "attack" ? "attack" : "normal")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawType, rawMode])

  function goPlay(isQuick?: boolean) {
    // ✅ kind がクエリに乗らない/消える事故に備えて保存
    try {
      sessionStorage.setItem("lastGameKind", safeKind)
    } catch {}

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

  // ✅ quick=1 は即プレイ導線
  // ❌ router.replace(`/game/${safeKind}`) は事故るので削除（説明ページが tile-drop に固定される原因になり得る）
  useEffect(() => {
    if (!quick) return
    goPlay(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quick]) // quick だけでOK（safeKindはprop由来で安定）

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
        </div>

        {toast ? (
          <div className={styles.help} style={{ fontWeight: 900 }}>
            {toast}
          </div>
        ) : null}
      </section>
    </main>
  )
}