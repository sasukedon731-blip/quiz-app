"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/app/lib/firebase"
import { submitAttackScore } from "./firestore"

import type { QuizType } from "@/app/data/types"
import type { GameMode, MemoryBurstQuestion } from "./types"
import { getMemoryBurstPool } from "./pools/memoryBurstPools"

const ATTACK_LEVELS: QuizType[] = ["japanese-n4","japanese-n3","japanese-n2"]

function levelLabel(i: number): "N4"|"N3"|"N2" { return i===2 ? "N2" : i===1 ? "N3" : "N4" }

type Phase = "ready" | "show" | "question" | "over"

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function MemoryBurstGame({
  quizType,
  modeParam,
}: {
  quizType: QuizType
  modeParam: string | null
}) {
  const router = useRouter()
  const params = useSearchParams()
  const autostart = params.get("autostart") === "1"
  const mode: GameMode = modeParam === "attack" ? "attack" : "normal"
  const isAttack = mode === "attack" && quizType.startsWith("japanese-")
  const [attackLevelIndex, setAttackLevelIndex] = useState(0)
  const [stageCorrect, setStageCorrect] = useState(0)
  const [maxLevelReached, setMaxLevelReached] = useState(0)
  const [bestStageAtMax, setBestStageAtMax] = useState(0)
  const activeQuizType: QuizType = isAttack ? ATTACK_LEVELS[attackLevelIndex] : quizType
  const section = params.get("section") // いまは未使用（将来拡張用）

  const pool = useMemo(() => {
    let list = getMemoryBurstPool(activeQuizType)
    // 将来：sectionで絞るならここ
    void section
    return list.filter((q) => q.enabled)
  }, [quizType, section])

  const [phase, setPhase] = useState<Phase>("ready")
  const [life, setLife] = useState(3)

  // ✅ ライフが0になったら確実に終了（state更新順のズレ対策）
  useEffect(() => {
    if (phase !== "ready" && phase !== "over" && life <= 0) {
      setPhase("over")
    }
  }, [life, phase])
  const [uid, setUid] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>("")
  const [score, setScore] = useState(0)
  const [current, setCurrent] = useState<MemoryBurstQuestion | null>(null)
  const [feedback, setFeedback] = useState<string>("")
  const [showMs] = useState<number>(2500)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null)
      setDisplayName(u?.displayName ?? "")
    })
    return () => unsub()
  }, [])


 

  useEffect(() => {
    if (phase === "ready") return
    if (life > 0) return
    setPhase("over")
  }, [life, phase])

  useEffect(() => {
    if (!isAttack) return
    if (phase !== "over") return
    if (!uid) return
    submitAttackScore({
      gameId: "memory-burst",
      uid,
      displayName: displayName || "匿名",
      score,
      bestLevel: levelLabel(maxLevelReached),
      bestStage: bestStageAtMax,
    }).catch(() => null)
  }, [isAttack, phase, uid, displayName, score, maxLevelReached, bestStageAtMax])
 // タイマー（playing中のみ）

  useEffect(() => {
    if (autostart) {
      start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart])

  function start() {
    setScore(0)
    setFeedback("")
    setLife(3)
    if (isAttack) {
      setAttackLevelIndex(0)
      setStageCorrect(0)
      setMaxLevelReached(0)
      setBestStageAtMax(0)
    }
    const q = pickRandom(pool)
    setCurrent(q || null)
    setPhase("show")
    // show → question
    window.setTimeout(() => {
      setPhase("question")
    }, showMs)
  }

  function next() {
    const q = pickRandom(pool)
    setCurrent(q || null)
    setFeedback("")
    setPhase("show")
    window.setTimeout(() => {
      setPhase("question")
    }, showMs)
  }

  function choose(i: number) {
    if (!current) return
    const ok = i === current.correctIndex
    if (ok) {
      setScore((s) => s + 15)
      setFeedback("✅ 正解！")
      if (isAttack) {
        setStageCorrect((prev) => {
          const next = prev + 1
          setBestStageAtMax((bs) => (attackLevelIndex === maxLevelReached ? Math.max(bs, Math.min(next, 30)) : bs))
          if (next >= 30) {
            setAttackLevelIndex((i) => {
              const ni = (i + 1) % 3
              setMaxLevelReached((m) => Math.max(m, ni))
              return ni
            })
            return 0
          }
          return next
        })
      }
    } else {
      setScore((s) => Math.max(0, s - 5))
      setFeedback("❌ ちがう")
      setLife((prev) => {
        const next = prev - 1
        return next < 0 ? 0 : next
      })
    }
    window.setTimeout(() => {
      next()
    }, 600)
  }

  const choiceStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
    fontSize: "clamp(16px, 4.8vw, 20px)",
    lineHeight: 1.2,
    textAlign: "left",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={() => router.push(`/game?type=${quizType}&kind=tile-drop`)}
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          ← 戻る
        </button>
        <div style={{ fontWeight: 700 }}>フラッシュ記憶</div>
        <div />
      </div>

      {phase === "ready" && !autostart && (
        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>一瞬表示 → 記憶で答える</div>
          <div style={{ opacity: 0.9, lineHeight: 1.6 }}>
            文章が一瞬だけ表示されます。
            <br />
            消えたあとに質問に答えてください。
          </div>
          <div style={{ marginTop: 12, opacity: 0.85 }}>問題数：{pool.length}問</div>
          <button
            onClick={start}
            style={{ marginTop: 14, width: "100%", padding: "12px 14px", borderRadius: 12, fontWeight: 900 }}
          >
            ゲーム開始
          </button>
        </div>
      )}

      {(phase === "show" || phase === "question") && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 900 }}>❤️ {life}</div>
            <div style={{ fontWeight: 900 }}>score {score}</div>
          </div>

          <div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
            {phase === "show" ? (
              <div style={{ fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 900, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {current?.displayText ?? ""}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "clamp(16px, 4.6vw, 22px)", fontWeight: 900, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {current?.question ?? ""}
                </div>
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {(current?.choices ?? []).map((c, i) => (
                    <button key={i} onClick={() => choose(i)} style={choiceStyle}>
                      {c}
                    </button>
                  ))}
                </div>
                {feedback && <div style={{ marginTop: 10, fontWeight: 900 }}>{feedback}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "over" && (
        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>終了！</div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>score: {score}</div>
          <button
            onClick={() => setPhase("ready")}
            style={{ marginTop: 14, width: "100%", padding: "12px 14px", borderRadius: 12, fontWeight: 900 }}
          >
            もう一回
          </button>
        </div>
      )}
    </div>
  )
}
