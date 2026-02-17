
"use client"

import { useSearchParams } from "next/navigation"
import ChoiceBattleGame from "./engines/ChoiceBattleGame"
import type { QuizType } from "@/app/data/types"

export default function GameClient() {
  const params = useSearchParams()
  const quizType = (params.get("type") as QuizType) || "gaikoku-license"
  const mode = (params.get("mode") as "normal" | "attack") || "normal"

  if (quizType === "gaikoku-license") {
    return <ChoiceBattleGame quizType={quizType} mode={mode} />
  }

  return <div>他のゲームエンジンをここに表示</div>
}
