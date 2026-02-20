"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
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

export default function TileDropGame({
  quizType,
  modeParam,
}: {
  quizType: QuizType
  modeParam: string | null
}) {
  const router = useRouter()

  const [uid, setUid] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>("")

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
  // ✅ ゲストでも遊べる前提：ログインしていれば uid/displayName を補完するだけ（未ログインでもリダイレクトしない）
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
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
  }, [])

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
    // ゲストが attack を選んだ場合：ノーマルに落とす（ランキングはログイン必須）
    if (mode === "attack" && !uid) {
      setToast("ランキングはログインが必要です（ノーマルで開始します）")
      setMode("normal")
      setTimeout(() => startGameAs("normal"), 0)
      return
    }
    startGameAs(mode)
  }

  function startGameAs(nextMode: GameMode) {
    setScore(0)
    setCombo(0)
    setLife(3)
    setLevel(1)
    setBestScore(0)
    setLeaderboard([])

    setPhase("playing")
    // delay a tick so poolByDifficulty is ready
    setTimeout(() => {
      resetRound(nextMode, difficulty, 1)
    }, 0)
  }

  async function endGame() {
    setPhase("over")

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

  // Playing領域（上のコンパクトバー＋カードpadding分を差し引く）
  // ※ 後で詰める前提でまず効かせる値
  const playAreaHeight = "calc(100svh - 140px)"

  return (
    <main style={styles.page} className="game-root">
      <div style={styles.shell}>
        {/* Compact bar（スマホ最適） */}
        <div style={styles.compactBar}>
          <Link href="/select-mode" style={styles.compactBack}>
            ←
          </Link>

          <div style={styles.compactCenter}>
            <div style={styles.compactTitle}>日本語バトル（落ち物）</div>
            <div style={styles.compactSub}>{quizTitle}</div>
          </div>

          <div style={styles.compactStats}>
            <span style={styles.badge}>S {score}</span>
            <span style={styles.badge}>❤ {life}</span>
          </div>
        </div>

        {/* Content */}
        <section style={styles.card}>
          {/* Ready */}
          <div style={{ display: phase === "ready" ? "block" : "none" }}>
            <div style={styles.panelTitle}>スタート設定</div>

            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
              教材：<b>{quizTitle}</b>（変更は「学習メニュー」から）
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
                      if (!uid) {
                        setToast("ランキングはログインが必要です（ノーマル推奨）")
                        setMode("normal")
                        return
                      }
                      setMode("attack")
                    }}
                  >
                    アタック（ランキング）
                  </button>
                </div>
                <div style={styles.help}>
                  ノーマル：難易度固定 / アタック：速度UP + 難易度が徐々に上がる
                </div>

                {!uid ? (
                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>
                    ※ ゲストはノーマルのみ。ランキング参加は
                    <button
                      onClick={() => router.push("/login")}
                      style={{ ...styles.inlineLinkBtn }}
                    >
                      ログイン
                    </button>
                    が必要です。
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
            <div style={{ position: "relative", height: playAreaHeight, overflow: "hidden" }}>
              {/* Danger line */}
              <div style={styles.dangerLine} />

              {/* Overlay chips */}
              <div style={styles.overlayChips}>
                <span style={styles.chip}>Lv {level}</span>
                <span style={styles.chip}>Combo {combo}</span>
                {mode === "attack" ? <span style={styles.chip}>Attack</span> : null}
              </div>

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
                    <button key={`${c}-${idx}`} onClick={() => onTilePress(c)} style={styles.tileBtn}>
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
              <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>ノーマルはランキング保存しません（学習用）</div>
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
      </div>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100svh",
    background: "#f6f7fb",
    padding: "clamp(10px, 3vw, 18px)" as any,
  },
  shell: {
    maxWidth: 980,
    margin: "0 auto",
  },

  // ✅ Compact bar（スマホ最適）
  compactBar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    height: 52,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: "rgba(246,247,251,0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
    marginBottom: 10,
  },
  compactBack: {
    width: 36,
    height: 36,
    display: "grid",
    placeItems: "center",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    background: "#fff",
    border: "1px solid #e5e7eb",
    color: "#111827",
    boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
  },
  compactCenter: { flex: 1, minWidth: 0 },
  compactTitle: { fontSize: 14, fontWeight: 900, lineHeight: 1.1 },
  compactSub: {
    fontSize: 12,
    opacity: 0.7,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  compactStats: { display: "flex", gap: 8, alignItems: "center" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 10px",
    borderRadius: 999,
    background: "#111827",
    color: "#fff",
    fontWeight: 900,
    fontSize: 12,
  },

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

  inlineLinkBtn: {
    marginLeft: 6,
    border: "none",
    background: "transparent",
    padding: 0,
    color: "#2563eb",
    fontWeight: 900,
    cursor: "pointer",
    textDecoration: "underline",
  },

  btn: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnMain: { background: "#2563eb", color: "#fff" },
  btnGhost: { background: "#111827", color: "#fff" },

  dangerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "58%" as any,
    height: 2,
    background: "rgba(239,68,68,0.6)",
  },

  // ✅ Lv/Combo などを小さく浮かせる
  overlayChips: {
    position: "absolute",
    top: 10,
    right: 12,
    display: "flex",
    gap: 8,
    zIndex: 20,
  },
  chip: {
    padding: "8px 10px",
    borderRadius: 999,
    background: "#fff",
    border: "1px solid #e5e7eb",
    fontWeight: 900,
    fontSize: 12,
    boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
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
  prompt: {
    fontSize: "clamp(18px, 5vw, 22px)" as any,
    fontWeight: 900,
    textAlign: "center",
    padding: "14px 0 8px",
  },
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
    zIndex: 30,
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
}