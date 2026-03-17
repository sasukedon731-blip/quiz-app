// app/lib/getSpeakingHistory.ts

import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/app/lib/firebase"

export type SpeakingHistoryItem = {
  id: string
  prompt: string
  candidate: string
  transcript: string
  totalScore: number
  evaluation: {
    meaning: number
    naturalness: number
    politeness: number
    totalScore: number
    comment?: string
  } | null
  createdAt: Date | null
}

export async function getSpeakingHistory(
  uid: string
): Promise<SpeakingHistoryItem[]> {
  const ref = collection(db, "users", uid, "speakingHistory")
  const q = query(ref, orderBy("createdAt", "desc"))
  const snap = await getDocs(q)

  return snap.docs.map((doc) => {
    const d = doc.data()
    const evaluationRaw = d.evaluation ?? null

    return {
      id: doc.id,
      prompt: typeof d.prompt === "string" ? d.prompt : "",
      candidate: typeof d.candidate === "string" ? d.candidate : "",
      transcript: typeof d.transcript === "string" ? d.transcript : "",
      totalScore:
        typeof d.totalScore === "number"
          ? d.totalScore
          : typeof evaluationRaw?.totalScore === "number"
          ? evaluationRaw.totalScore
          : 0,
      evaluation: evaluationRaw
        ? {
            meaning:
              typeof evaluationRaw.meaning === "number"
                ? evaluationRaw.meaning
                : 0,
            naturalness:
              typeof evaluationRaw.naturalness === "number"
                ? evaluationRaw.naturalness
                : 0,
            politeness:
              typeof evaluationRaw.politeness === "number"
                ? evaluationRaw.politeness
                : 0,
            totalScore:
              typeof evaluationRaw.totalScore === "number"
                ? evaluationRaw.totalScore
                : 0,
            comment:
              typeof evaluationRaw.comment === "string"
                ? evaluationRaw.comment
                : undefined,
          }
        : null,
      createdAt:
        d.createdAt && typeof d.createdAt.toDate === "function"
          ? d.createdAt.toDate()
          : null,
    }
  })
}