// app/(auth)/game/page.tsx
import GameClient from "./GameClient"
import type { QuizType } from "@/app/data/types"

function isQuizType(v: any): v is QuizType {
  return v === "gaikoku-license" || v === "japanese-n4" || v === "genba-listening"
  // ↑ ここはあなたの QuizType union に合わせて増やしてOK
}

export default function GamePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const raw = searchParams?.type
  const type = Array.isArray(raw) ? raw[0] : raw

  const quizType: QuizType = isQuizType(type) ? type : "japanese-n4"

  return <GameClient quizType={quizType} />
}