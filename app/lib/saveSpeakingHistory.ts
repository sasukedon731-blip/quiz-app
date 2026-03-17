// app/lib/saveSpeakingHistory.ts

import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/app/lib/firebase"

type SpeakingHistoryInput = {
  uid: string
  prompt: string
  candidate: string
  transcript: string
  evaluation: {
    meaning: number
    naturalness: number
    politeness: number
    totalScore: number
    comment?: string
  }
}

export async function saveSpeakingHistory(input: SpeakingHistoryInput) {
  const {
    uid,
    prompt,
    candidate,
    transcript,
    evaluation,
  } = input

  const ref = collection(db, "users", uid, "speakingHistory")

  await addDoc(ref, {
    type: "speaking",
    prompt,
    candidate,
    transcript,
    evaluation,
    totalScore: evaluation.totalScore,
    createdAt: serverTimestamp(),
  })
}