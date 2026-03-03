"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import type { QuizType } from "@/app/data/types"
import TileDropGame from "./TileDropGame"
import SpeedChoiceGame from "./SpeedChoiceGame"
import FlashJudgeGame from "./FlashJudgeGame"
import MemoryBurstGame from "./MemoryBurstGame"
import type { GameKind } from "./types"

import { useAuth } from "@/app/lib/useAuth"
import { canGuestPlayToday, markGuestPlayedToday } from "./guestLimit"

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

function isGameKind(v: any): v is GameKind {
  return (
    v === "tile-drop" ||
    v === "speed-choice" ||
    v === "flash-judge" ||
    v === "memory-burst" ||
    v === "sentence-build"
  )
}

function GuestBlocked({ onLogin }: { onLogin: () => void }) {
  return (
    <main style={{ padding: 16, maxWidth: 560, margin: "0 auto" }}>
      <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>今日はもうプレイ済み！</div>
        <div style={{ marginTop: 8, opacity: 0.8, lineHeight: 1.6 }}>
          ゲストは <b>1日1回（ノーマルのみ）</b> まで。
          <br />
          ログインすると制限なしで遊べて、アタックのランキング保存も解放されるぜ。
        </div>
        <button
          onClick={onLogin}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            border: "none",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          ログインして続ける
        </button>
      </div>
    </main>
  )
}

export default function GameClient() {
  const params = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const rawType = params.get("type")
  const rawMode = params.get("mode") // "normal" | "attack"
  const rawKind = params.get("kind") // "tile-drop" | "speed-choice"

  const quizType: QuizType = useMemo(() => {
    return isQuizType(rawType) ? rawType : "japanese-n4"
  }, [rawType])

  const modeParam = rawMode === "attack" ? "attack" : "normal"

  const kind: GameKind = useMemo(() => {
    return isGameKind(rawKind) ? rawKind : "tile-drop" // ✅ デフォは落ちゲー
  }, [rawKind])

  // ✅ ゲスト1日1回（ノーマルのみ）
  const [guestOk, setGuestOk] = useState(true)

  useEffect(() => {
    if (modeParam !== "normal") return
    if (user) return
    setGuestOk(canGuestPlayToday())
  }, [modeParam, user])

  // ✅ ページ到達時点で今日プレイ済みにする（リロード抜け防止）
  useEffect(() => {
    if (modeParam !== "normal") return
    if (user) return
    if (!guestOk) return
    markGuestPlayedToday()
  }, [modeParam, user, guestOk])

  if (modeParam === "normal" && !user && !guestOk) {
    return <GuestBlocked onLogin={() => router.push("/login")} />
  }

  if (kind === "speed-choice") {
    return <SpeedChoiceGame quizType={quizType} modeParam={modeParam} />
  }

  if (kind === "flash-judge") {
    return <FlashJudgeGame quizType={quizType} modeParam={modeParam} />
  }

  if (kind === "memory-burst") {
    return <MemoryBurstGame quizType={quizType} modeParam={modeParam} />
  }

  return <TileDropGame quizType={quizType} modeParam={modeParam} />
}
