"use client"

import { useSearchParams } from "next/navigation"
import type { QuizType } from "@/app/data/types"
import ChoiceBattleGame from "./engines/ChoiceBattleGame"
import TileDropGame from "./TileDropGame"

export default function GameClient() {
  const params = useSearchParams()
  const quizType = (params.get("type") as QuizType) || "gaikoku-license"
  const modeParam = params.get("mode")

  // 外国免許：スピード4択バトル
  if (quizType === "gaikoku-license") {
    const mode = modeParam === "attack" ? "attack" : "normal"
    return <ChoiceBattleGame quizType={quizType} mode={mode} />
  }

  // 日本語N4など：既存の落ち物（ネプリーグ風）
  return <TileDropGame quizType={quizType} modeParam={modeParam} />
}
