"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { AnimatePresence, motion } from "framer-motion"

import { auth, db } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import type { GameDifficulty, GameMode, GameQuestion } from "./types"
import { fallbackQuestions } from "./questions"
import { fetchAttackLeaderboard, submitAttackScore } from "./firestore"
import { buildGamePoolFromQuizzes } from "./fromQuizzes"

type Phase = "ready" | "playing" | "over"

// ✅ ゲスト（未ログイン）の「1日1回」制限キー
function guestTodayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `guest-play-${y}-${m}-${day}`
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function difficultyForAttack(level: number): GameDifficulty {
  if (level <= 3) return "N5"
  if (level <= 6) return "N4"
  if (level <= 9) return "N3"
  if (level <= 12) return "N2"
  return "N1"
}

function speedFor(mode: GameMode, level: number) {
  if (mode === "normal") return 5.5
  // attack: gets faster
  return clamp(6 - (level - 1) * 0.28, 2.2, 6)
}

export default function TileDropGame({ quizType, modeParam }: { quizType: QuizType; modeParam: string | null }) {
  const router = useRouter()

  const [uid, setUid] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>("")

  // ✅ ゲスト（未ログイン）: 1日1回プレイ + 終了後に登録導線
  const isGuest = !uid
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false)
  const [showGuestUpsellModal, setShowGuestUpsellModal] = useState(false)

  const [phase, setPhase] = useState<Phase>("ready")
  const [mode, setMode] = useState<GameMode>(modeParam === "attack" ? "attack" : "normal")
  const [difficulty, setDifficulty] = useState<GameDifficulty>("N5")

  // ✅ quizzes から作る（Firestore手入力不要）
  const pool = useMemo(() => {
    const built = buildGamePoolFromQuizzes(quizType)
    if (built.length) return built.filter((q) => q.enabled)
    // hard fallback
    return fallbackQuestions.filter((q) => q.enabled)
  }, [quizType])

  // 教材が変わったら、表示用の難易度も合わせる
  useEffect(() => {
    const d = pool[0]?.difficulty
    if (d) setDifficulty(d)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizType])

  // URLの mode=attack を反映（ready のときだけ）
  useEffect(() => {
    if (phase !== "ready") return
    if (modeParam === "attack") setMode("attack")
    else if (modeParam === "normal") setMode("normal")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeParam, quizType, phase])

  const [score, setScore] = useState(0)
  const [life, setLife] = useState(3)
  const [level, setLevel] = useState(1)
  const [combo, setCombo] = useState(0)

  const [current, setCurrent] = useState<GameQuestion | null>(null)
  const [inputIndex, setInputIndex] = useState(0)
  const [shake, setShake] = useState(0)
  const [toast, setToast] = useState<string>("")

  const [bestScore, setBestScore] = useState<number>(0) // attack best
  const [leaderboard, setLeaderboard] = useState<{ displayName: string; bestScore: number }[]>([])

  // Guards against double-judgement (success then animationComplete miss)
  const activeKeyRef = useRef<string>("")
  const resolvedRef = useRef<boolean>(false)

  // ===== Auth =====
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        // ✅ /game は未ログイン（ゲスト）でも遊べる
        setUid(null)
        setDisplayName("")
        return
      }
      setUid(u.uid)

      // displayName: prefer Auth, fallback Firestore users/{uid}
      const dn = u.displayName || ""
      if (dn) {
        setDisplayName(dn)
        return
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid))
        const v = snap.exists() ? (snap.data() as any) : null
        if (v?.displayName) setDisplayName(String(v.displayName))
      } catch {
        // ignore
      }
    })
    return () => unsub()
  }, [router])

  // ✅ ゲスト：今日すでに遊んだかを初回チェック
  useEffect(() => {
    if (!isGuest) {
      setShowGuestLimitModal(false)
      return
    }
    try {
      const played = localStorage.getItem(guestTodayKey())
      if (played) setShowGuestLimitModal(true)
    } catch {
      // ignore
    }
  }, [isGuest])

  // quizzes方式なのでロードは不要（UIの余計な再読込ボタンも不要）

  const poolByDifficulty = useMemo(() => {
    const map = new Map<string, GameQuestion[]>()
    for (const q of pool) {
      const k = q.difficulty
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(q)
    }
    return map
  }, [pool])

  function pickQuestion(nextMode: GameMode, nextDifficulty: GameDifficulty, nextLevel: number) {
    const wantDifficulty = nextMode === "attack" ? difficultyForAttack(nextLevel) : nextDifficulty
    const candidates = poolByDifficulty.get(wantDifficulty) ?? []

    if (candidates.length > 0) return pickRandom(candidates)

    // fallback: any
    if (pool.length > 0) return pickRandom(pool)

    // hard fallback
    return fallbackQuestions[0]
  }

  function resetRound(nextMode: GameMode, nextDifficulty: GameDifficulty, nextLevel: number) {
    const q = pickQuestion(nextMode, nextDifficulty, nextLevel)
    setCurrent(q)
    setInputIndex(0)
    resolvedRef.current = false
    activeKeyRef.current = `${q.id}:${Date.now()}`
    setToast("")
  }

  function startGame() {
    // ✅ ゲスト：1日1回だけプレイ可（開始時点で消費してリロード回避）
    if (isGuest) {
      try {
        const key = guestTodayKey()
        const played = localStorage.getItem(key)
        if (played) {
          setShowGuestLimitModal(true)
          return
        }
        localStorage.setItem(key, "1")
      } catch {
        // ignore（localStorageが使えない場合でもプレイは許可）
      }
    }

    setScore(0)
    setCombo(0)
    setLife(3)
    setLevel(1)
    setBestScore(0)
    setLeaderboard([])

    setPhase("playing")
    // delay a tick so poolByDifficulty is ready
    setTimeout(() => {
      resetRound(mode, difficulty, 1)
    }, 0)
  }

  async function endGame() {
    setPhase("over")

    // ✅ ゲスト：終了後に「保存/ランキング」を見せて登録導線
    if (isGuest) {
      setShowGuestUpsellModal(true)
      return
    }

    if (mode !== "attack" || !uid) return

    // 1) get current best from Firestore (optional, cheap)
    let currentBest = 0
    try {
      const snap = await getDoc(doc(db, "attackLeaderboard", uid))
      if (snap.exists()) {
        const v = snap.data() as any
        currentBest = Number(v?.bestScore ?? 0)
      }
    } catch {
      // ignore
    }

    // 2) submit
    try {
      const res = await submitAttackScore({
        uid,
        displayName: displayName || "匿名",
        score,
        currentBestScore: currentBest,
      })
      setBestScore(res.bestScore)
    } catch (e) {
      console.error(e)
    }

    // 3) leaderboard
    try {
      const lb = await fetchAttackLeaderboard(30)
      setLeaderboard(lb.map((x) => ({ displayName: x.displayName, bestScore: x.bestScore })))
    } catch (e) {
      console.error(e)
    }
  }

  function miss(reason: "timeout" | "wrong") {
    if (phase !== "playing") return
    if (resolvedRef.current) return

    resolvedRef.current = true
    setCombo(0)
    setShake((x) => x + 1)

    setLife((prev) => {
      const next = prev - 1
      if (next <= 0) {
        // game over
        setTimeout(() => endGame(), 50)
        return 0
      }
      // next question
      setTimeout(() => {
        const nextLevel = mode === "attack" ? level + 1 : level
        if (mode === "attack") setLevel(nextLevel)
        resetRound(mode, difficulty, nextLevel)
      }, 280)
      return next
    })

    if (reason === "timeout") setToast("時間切れ！")
    else setToast("ミス！")
  }

  function success() {
    if (phase !== "playing") return
    if (!current) return
    if (resolvedRef.current) return

    resolvedRef.current = true

    const base = 10 * current.answer.length
    const comboBonus = Math.min(combo, 20)
    const gained = base + comboBonus

    setScore((s) => s + gained)
    setCombo((c) => c + 1)
    setToast(`+${gained}`)

    setTimeout(() => {
      const nextLevel = mode === "attack" ? level + 1 : level
      if (mode === "attack") setLevel(nextLevel)
      resetRound(mode, difficulty, nextLevel)
    }, 220)
  }

  function onTilePress(label: string) {
    if (phase !== "playing") return
    if (!current) return
    if (resolvedRef.current) return

    const expected = current.answer[inputIndex]
    if (label !== expected) {
      miss("wrong")
      return
    }

    const next = inputIndex + 1
    setInputIndex(next)

    if (next >= current.answer.length) {
      success()
    }
  }

  const speedSec = useMemo(() => speedFor(mode, level), [mode, level])
  const fallY = 420

  const plateKey = current ? activeKeyRef.current : "none"

  // ===== Render =====
  const quizTitle = (quizzes as any)[quizType]?.title || quizType

  return (
    <main style={styles.page} className="game-root">
      <div style={styles.shell}>
        {/* Top nav */}
        <div style={styles.topRow}>
          <Link href="/select-mode" style={styles.link}>
            ← 学習メニューへ
          </Link>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {isGuest ? <span style={styles.guestBadge}>無料体験（1日1回）</span> : null}
            <div style={{ fontSize: 12, opacity: 0.7 }}>{displayName ? `User: ${displayName}` : ""}</div>
          </div>
        </div>

        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>落ち物ネプリーグ（{quizTitle}）</h1>
            <div style={styles.sub}>
              教材別ゲーム：<b>{quizType}</b>（同じ問題をゲーム化）
            </div>
          </div>

          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={styles.statLabel}>SCORE</div>
              <div style={styles.statValue}>{score}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>LIFE</div>
              <div style={styles.statValue}>{"❤".repeat(life)}{life === 0 ? "" : ""}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>LEVEL</div>
              <div style={styles.statValue}>{level}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>COMBO</div>
              <div style={styles.statValue}>{combo}</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section style={styles.card}>
          {/* Ready */}
          <div style={{ display: phase === "ready" ? "block" : "none" }}>
            <div style={styles.panelTitle}>スタート設定</div>

            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
              教材：<b>{quizTitle}</b>（変更は「学習メニューへ」から）
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <div style={styles.label}>モード</div>
                <div style={styles.seg}>
                  <button
                    style={{ ...styles.segBtn, ...(mode === "normal" ? styles.segActive : {}) }}
                    onClick={() => setMode("normal")}
                  >
                    ノーマル（学習）
                  </button>
                  <button
                    style={{ ...styles.segBtn, ...(mode === "attack" ? styles.segActive : {}) }}
                    onClick={() => {
                      if (isGuest) {
                        setShowGuestUpsellModal(true)
                        return
                      }
                      setMode("attack")
                    }}
                    disabled={isGuest}
                  >
                    アタック（ランキング）
                  </button>
                </div>
                <div style={styles.help}>
                  ノーマル：難易度固定 / アタック：速度UP + 難易度が徐々に上がる
                </div>
                {isGuest ? (
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.72, lineHeight: 1.6 }}>
                    ※ アタック（ランキング）は<strong>ログイン後</strong>に解放されます
                  </div>
                ) : null}
              </div>

              <div style={styles.field}>
                <div style={styles.label}>難易度</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ ...styles.pill, ...styles.pillActive, cursor: "default" }}>
                    {pool[0]?.difficulty ?? difficulty}
                  </span>
                </div>
                <div style={styles.help}>
                  ※ 教材ごとに難易度は固定（例：日本語N4→N4）。アタックは速度UPで難しくなります。
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={startGame}
                disabled={pool.length === 0}
                style={{ ...styles.btn, ...styles.btnMain }}
              >
                ゲーム開始
              </button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              問題数：<b>{pool.length}</b>（この教材の既存クイズから生成）
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              ※ランキングは <code>attackLeaderboard</code> に保存（教材別に分けたい場合は次で対応）
            </div>
          </div>

          {/* Playing */}
          <div style={{ display: phase === "playing" ? "block" : "none" }}>
            <div style={{ position: "relative", height: 520, overflow: "hidden" }}>
              {/* Danger line */}
              <div style={styles.dangerLine} />

              {/* Toast */}
              <AnimatePresence>
                {toast ? (
                  <motion.div
                    key={toast}
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    style={styles.toast}
                  >
                    {toast}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Falling plate */}
              <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
                <AnimatePresence>
                  {current ? (
                    <motion.div
                      key={plateKey}
                      initial={{ y: -120, opacity: 1, x: 0 }}
                      animate={{
                        y: fallY,
                        opacity: 1,
                        x: shake % 2 === 0 ? 0 : 0,
                      }}
                      transition={{ duration: speedSec, ease: "linear" }}
                      onAnimationComplete={() => {
                        // If this plate is still the active one and not resolved, it's a miss.
                        if (resolvedRef.current) return
                        miss("timeout")
                      }}
                      style={styles.plate}
                    >
                      <div style={styles.plateBadge}>{current.type.toUpperCase()}</div>
                      <div style={styles.prompt}>{current.prompt}</div>
                      <div style={styles.progress}>
                        {current.answer.map((a, i) => (
                          <span
                            key={`${a}-${i}`}
                            style={{
                              ...styles.dot,
                              opacity: i < inputIndex ? 1 : 0.25,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Tiles */}
              <div style={styles.tilesArea}>
                <div style={styles.tilesTitle}>タイルを順番に押せ</div>
                <div style={styles.tilesGrid}>
                  {(current?.choices ?? []).map((c, idx) => (
                    <button
                      key={`${c}-${idx}`}
                      onClick={() => onTilePress(c)}
                      style={styles.tileBtn}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      setPhase("ready")
                      setCurrent(null)
                      setToast("")
                    }}
                    style={{ ...styles.btn, ...styles.btnGhost }}
                  >
                    中断して戻る
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Over */}
          <div style={{ display: phase === "over" ? "block" : "none" }}>
            <div style={styles.panelTitle}>ゲームオーバー</div>
            <div style={{ marginTop: 8, fontSize: 14 }}>
              スコア：<b style={{ fontSize: 22 }}>{score}</b>
            </div>

            {mode === "attack" ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 13, opacity: 0.85 }}>
                  あなたのベスト：<b>{bestScore}</b>
                </div>

                <div style={{ marginTop: 12, ...styles.lbBox }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>ランキング（全期間 / 上位30）</div>
                  {leaderboard.length === 0 ? (
                    <div style={{ fontSize: 13, opacity: 0.7 }}>読み込み中 / まだデータがありません</div>
                  ) : (
                    <ol style={{ margin: 0, paddingLeft: 18 }}>
                      {leaderboard.map((x, i) => (
                        <li key={`${x.displayName}-${i}`} style={{ marginBottom: 6, fontSize: 13 }}>
                          <span style={{ fontWeight: 900 }}>{i + 1}.</span> {x.displayName} — <b>{x.bestScore}</b>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
                ノーマルはランキング保存しません（学習用）
              </div>
            )}

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setPhase("ready")
                  setCurrent(null)
                  setToast("")
                }}
                style={{ ...styles.btn, ...styles.btnMain }}
              >
                もう一回
              </button>
              <Link href="/select-mode" style={{ ...styles.btn, ...styles.btnGhost, textDecoration: "none" }}>
                学習メニューへ
              </Link>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
          ※ Firestoreが空でも動くように内蔵問題を用意。Firestoreに入れれば自動でそちらが優先。
        </div>

        {/* ===== Guest Modals ===== */}
        <AnimatePresence>
          {showGuestLimitModal ? (
            <motion.div
              key="guest-limit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalOverlay}
            >
              <motion.div
                initial={{ y: 10, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 10, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                style={styles.modal}
              >
                <div style={styles.modalTitle}>🎮 今日の無料プレイは終了しました</div>
                <div style={styles.modalText}>
                  明日また挑戦できます。<br />
                  会員登録すると、<b>無制限プレイ</b>・<b>スコア保存</b>・<b>ランキング</b>が解放されます。
                </div>

                <div style={styles.modalBtns}>
                  <button
                    style={{ ...styles.btn, ...styles.btnMain, flex: 1 }}
                    onClick={() => router.push("/register")}
                  >
                    無料で会員登録
                  </button>
                  <button
                    style={{ ...styles.btn, ...styles.btnSub, flex: 1 }}
                    onClick={() => router.push("/login")}
                  >
                    ログイン
                  </button>
                </div>

                <button
                  style={{ ...styles.btn, ...styles.btnGhost, width: "100%", marginTop: 10 }}
                  onClick={() => setShowGuestLimitModal(false)}
                >
                  明日また来る
                </button>
              </motion.div>
            </motion.div>
          ) : null}

          {showGuestUpsellModal ? (
            <motion.div
              key="guest-upsell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalOverlay}
            >
              <motion.div
                initial={{ y: 10, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 10, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                style={styles.modal}
              >
                <div style={styles.modalTitle}>🔥 記録を残す？</div>
                <div style={styles.modalText}>
                  今日のスコア：<b style={{ fontSize: 18 }}>{score}</b>
                  <br />
                  ゲストの記録は保存されません。会員登録で <b>保存</b> / <b>ランキング</b> / <b>レベル保持</b> を解放できます。
                </div>

                <div style={styles.modalBtns}>
                  <button
                    style={{ ...styles.btn, ...styles.btnMain, flex: 1 }}
                    onClick={() => router.push("/register")}
                  >
                    無料で続ける
                  </button>
                  <button
                    style={{ ...styles.btn, ...styles.btnSub, flex: 1 }}
                    onClick={() => setShowGuestUpsellModal(false)}
                  >
                    今はいい
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100svh",
    background: "#f6f7fb",
    padding: "clamp(10px, 3vw, 18px)" as any,
  },
  shell: {
    maxWidth: 980,
    margin: "0 auto",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 900,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  h1: { margin: 0, fontSize: 22, letterSpacing: 0.2 },
  sub: { marginTop: 6, fontSize: 13, opacity: 0.75 },
  stats: { display: "flex", gap: 10, flexWrap: "wrap" },
  stat: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "10px 12px",
    minWidth: 110,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
  statLabel: { fontSize: 11, opacity: 0.6, fontWeight: 900, letterSpacing: 0.3 },
  statValue: { marginTop: 2, fontSize: 16, fontWeight: 900 },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },

  panelTitle: { fontWeight: 900, fontSize: 16 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 },
  field: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 12,
  },
  label: { fontWeight: 900, fontSize: 12, opacity: 0.75 },
  help: { marginTop: 8, fontSize: 12, opacity: 0.7, lineHeight: 1.5 },

  seg: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" },
  segBtn: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  segActive: { border: "1px solid #2563eb", boxShadow: "0 0 0 3px rgba(37,99,235,0.12)" },

  pill: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  pillActive: { border: "1px solid #16a34a", boxShadow: "0 0 0 3px rgba(22,163,74,0.12)" },

  btn: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnMain: { background: "#2563eb", color: "#fff" },
  btnGhost: { background: "#111827", color: "#fff" },
  btnSub: { background: "#e5e7eb", color: "#111827" },

  guestBadge: {
    fontSize: 12,
    fontWeight: 900,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#111827",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
  },

  dangerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "58%" as any,
    height: 2,
    background: "rgba(239,68,68,0.6)",
  },

  plate: {
    width: "min(640px, 92%)",
    margin: "0 auto",
    background: "#111827",
    color: "#fff",
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 18px 34px rgba(0,0,0,0.22)",
    position: "relative",
  },
  plateBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 11,
    fontWeight: 900,
    opacity: 0.75,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
  },
  prompt: { fontSize: "clamp(18px, 5vw, 22px)" as any, fontWeight: 900, textAlign: "center", padding: "14px 0 8px" },
  progress: { display: "flex", justifyContent: "center", gap: 6, paddingBottom: 6 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#fff",
    display: "inline-block",
  },

  toast: {
    position: "absolute",
    top: 12,
    left: 12,
    padding: "8px 12px",
    borderRadius: 14,
    background: "#fff",
    border: "1px solid #e5e7eb",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
  },

  tilesArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "14px 14px calc(14px + env(safe-area-inset-bottom))" as any,
    background: "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.8))",
    borderTop: "1px solid #e5e7eb",
  },
  tilesTitle: { fontWeight: 900, marginBottom: 10 },
  tilesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(72px, 1fr))",
    gap: 10,
  },
  tileBtn: {
    padding: "clamp(10px, 2.6vw, 14px) clamp(8px, 2.2vw, 10px)" as any,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 900,
    fontSize: "clamp(14px, 4.2vw, 18px)" as any,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
  },

  lbBox: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 12,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,24,39,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 80,
  },
  modal: {
    width: "min(520px, 92vw)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    padding: 16,
    boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
  },
  modalTitle: { fontSize: 16, fontWeight: 900 },
  modalText: { marginTop: 10, fontSize: 13, opacity: 0.88, lineHeight: 1.7 },
  modalBtns: { marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" },
}
