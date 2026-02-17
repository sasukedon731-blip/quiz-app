"use client"

import { useSearchParams } from "next/navigation"
import type { QuizType } from "@/app/data/types"
import TileDropGame from "./TileDropGame"

export default function GameClient() {
  const params = useSearchParams()

  // ✅ ゲームは1本固定：日本語N4（typeは無視）
  const quizType: QuizType = "japanese-n4"

  // ✅ TileDropGame が期待しているのは modeParam
  const modeParam = params.get("mode") // "normal" | "attack" など

  return <TileDropGame quizType={quizType} modeParam={modeParam} />
}
