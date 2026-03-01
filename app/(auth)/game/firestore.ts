import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  serverTimestamp,
} from "firebase/firestore"

import { db } from "@/app/lib/firebase"
import type { GameDifficulty, GameMode, GameQuestion, LeaderboardEntry } from "./types"

// ===== Questions =====
// Firestore recommended structure:
// gameQuestions/{questionId}
//  - enabled: boolean
//  - type: "reading"|"fill"|"particle"
//  - prompt: string
//  - answer: string[]
//  - choices: string[]
//  - difficulty: "N5"|"N4"|"N3"|"N2"|"N1"
//  - updatedAt: timestamp

export async function fetchGameQuestions(params: {
  difficulty?: GameDifficulty
  mode: GameMode
  take?: number
}): Promise<GameQuestion[]> {
  const take = params.take ?? 60
  const col = collection(db, "gameQuestions")

  // Normal: filter by selected difficulty.
  // Attack: we usually fetch a wider pool (all difficulties) and pick based on level.
  const q = params.mode === "normal" && params.difficulty
    ? query(col, where("enabled", "==", true), where("difficulty", "==", params.difficulty), limit(take))
    : query(col, where("enabled", "==", true), limit(take))

  const snap = await getDocs(q)
  const items: GameQuestion[] = []
  snap.forEach((d) => {
    const v = d.data() as any
    if (!v) return
    // Basic validation (avoid runtime crashes)
    if (!v.prompt || !Array.isArray(v.answer) || !Array.isArray(v.choices) || !v.difficulty || !v.type) return
   items.push({
  id: d.id,

  // ✅ 追加：Firestoreにkindが無い古いデータでも動くように推定
  kind:
    (v.kind as any) ??
    (/漢字|読み|よみ|ひらがな|カタカナ/.test(String(v.prompt ?? "")) ? "speed-choice" : "tile-drop"),

  type: v.type,
  prompt: v.prompt,
  answer: v.answer,
  choices: v.choices,
  difficulty: v.difficulty,
  enabled: Boolean(v.enabled),
  quizType: v.quizType,
})
  })
  return items
}

// ===== Leaderboard =====
// Recommended structure:
// attackLeaderboard/{uid}
//  - uid
//  - displayName
//  - bestScore
//  - lastScore
//  - updatedAt

export async function submitAttackScore(params: {
  gameId: "tile-drop" | "flash-judge" | "memory-burst" | "speed-choice" | "sentence-build"
  uid: string
  displayName: string
  score: number
  bestLevel?: "N4" | "N3" | "N2"
  bestStage?: number
}): Promise<{ bestScore: number }> {
  // ✅ per-game leaderboard (Attack only)
  const ref = doc(db, "attackLeaderboards", params.gameId, "entries", params.uid)

  // Merge update: keep bestScore
  const bestScore = Math.max(params.score ?? 0, 0)

  await setDoc(
    ref,
    {
      uid: params.uid,
      displayName: params.displayName || "匿名",
      bestScore,
      bestLevel: params.bestLevel ?? "N4",
      bestStage: params.bestStage ?? 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return { bestScore }
}

export async function fetchAttackLeaderboard(params: {
  gameId: "tile-drop" | "flash-judge" | "memory-burst" | "speed-choice" | "sentence-build"
  take?: number
}): Promise<LeaderboardEntry[]> {
  const take = params.take ?? 50
  const col = collection(db, "attackLeaderboards", params.gameId, "entries")
  const q = query(col, orderBy("bestScore", "desc"), limit(take))
  const snap = await getDocs(q)
  const items: LeaderboardEntry[] = []
  snap.forEach((d) => {
    const v = d.data() as any
    if (!v) return
    items.push({
      uid: v.uid || d.id,
      displayName: v.displayName || "匿名",
      bestScore: Number(v.bestScore ?? 0),
      bestLevel: v.bestLevel,
      bestStage: Number(v.bestStage ?? 0),
      updatedAt: v.updatedAt,
    })
  })
  return items
}
