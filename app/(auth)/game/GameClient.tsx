"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

import type { QuizType } from "@/app/data/types"
import TileDropGame from "./TileDropGame"
import SpeedChoiceGame from "./SpeedChoiceGame"
import FlashJudgeGame from "./FlashJudgeGame"
import MemoryBurstGame from "./MemoryBurstGame"
import type { GameKind } from "./types"

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

export default function GameClient() {
  const params = useSearchParams()

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