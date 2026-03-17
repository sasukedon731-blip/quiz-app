import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/app/lib/firebase"

export type SpeakingHistoryItem = {
  id: string
  mode: string
  prompt: string
  recognizedText: string
  candidateText: string
  totalScore: number
  pronunciationScore: number
  naturalnessScore: number
  completionScore: number
  feedback: string
  createdAt: Date | null
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  return null
}

function toNumber(value: unknown, fallback = 0) {
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

export async function getSpeakingHistory(
  uid: string,
  maxCount = 30
): Promise<SpeakingHistoryItem[]> {
  if (!uid) return []

  const ref = collection(db, "users", uid, "speakingHistory")
  const q = query(ref, orderBy("createdAt", "desc"), limit(maxCount))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()

    return {
      id: doc.id,
      mode: String(data.mode || ""),
      prompt: String(data.prompt || ""),
      recognizedText: String(data.recognizedText || ""),
      candidateText: String(data.candidateText || ""),
      totalScore: toNumber(data.totalScore, 0),
      pronunciationScore: toNumber(data.pronunciationScore, 0),
      naturalnessScore: toNumber(data.naturalnessScore, 0),
      completionScore: toNumber(data.completionScore, 0),
      feedback: String(data.feedback || ""),
      createdAt: toDate(data.createdAt),
    }
  })
}