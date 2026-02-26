"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

import type { QuizType } from "@/app/data/types"
import TileDropGame from "./TileDropGame"
import SpeedChoiceGame from "./SpeedChoiceGame"
import type { GameKind } from "./types"

function isGameKind(v: string | null): v is GameKind {
  return v === "tile-drop" || v === "speed-choice" || v === "sentence-build"
}

export default function GameClient({ quizType }: { quizType: QuizType }) {
  const params = useSearchParams()
  const modeParam = params.get("mode") // "normal" | "attack"
  const kindParam = params.get("kind")

  const kind: GameKind = useMemo(() => {
    if (isGameKind(kindParam)) return kindParam
    // ✅ 最短でN4が出る導線
    if (quizType === "japanese-n4") return "speed-choice"
    return "tile-drop"
  }, [kindParam, quizType])

  if (kind === "speed-choice") {
    return <SpeedChoiceGame quizType={quizType} modeParam={modeParam} />
  }

  // sentence-build は後で追加（今は tile-drop に落としてOK）
  return <TileDropGame quizType={quizType} modeParam={modeParam} />
}