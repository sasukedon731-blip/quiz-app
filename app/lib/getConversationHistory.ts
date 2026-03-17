import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/app/lib/firebase"

export type ConversationHistoryItem = {
  id: string
  theme: string
  themeLabel: string
  level: string
  levelLabel: string
  totalScore: number
  createdAt: Date | null
  messages: {
    role: "ai" | "user" | "system"
    text: string
    createdAt?: number
  }[]
  evaluation: {
    clarity?: number | string
    naturalness?: number | string
    politeness?: number | string
    continuity?: number | string
    goodPoints?: string[]
    nextTips?: string[]
    comment?: string
  } | null
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  return null
}

export async function getConversationHistory(
  uid: string,
  maxCount = 30
): Promise<ConversationHistoryItem[]> {
  if (!uid) return []

  const ref = collection(db, "users", uid, "conversationHistory")
  const q = query(ref, orderBy("createdAt", "desc"), limit(maxCount))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()

    return {
      id: doc.id,
      theme: String(data.theme || ""),
      themeLabel: String(data.themeLabel || data.theme || ""),
      level: String(data.level || ""),
      levelLabel: String(data.levelLabel || data.level || ""),
      totalScore: Number(data.totalScore || 0),
      createdAt: toDate(data.createdAt),
      messages: Array.isArray(data.messages)
        ? data.messages.map((m: any) => ({
            role:
              m?.role === "user"
                ? "user"
                : m?.role === "ai"
                ? "ai"
                : "system",
            text: String(m?.text || ""),
            createdAt:
              typeof m?.createdAt === "number" ? m.createdAt : undefined,
          }))
        : [],
      evaluation:
        data.evaluation && typeof data.evaluation === "object"
          ? {
              clarity: data.evaluation.clarity,
              naturalness: data.evaluation.naturalness,
              politeness: data.evaluation.politeness,
              continuity: data.evaluation.continuity,
              goodPoints: Array.isArray(data.evaluation.goodPoints)
                ? data.evaluation.goodPoints.map((v: unknown) => String(v))
                : [],
              nextTips: Array.isArray(data.evaluation.nextTips)
                ? data.evaluation.nextTips.map((v: unknown) => String(v))
                : [],
              comment: String(data.evaluation.comment || ""),
            }
          : null,
    }
  })
}