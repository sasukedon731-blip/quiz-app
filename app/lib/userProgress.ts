import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firestore"

export type QuizResult = {
  score: number
  total: number
  mode: string
  createdAt: any
}

export async function saveQuizResult(
  uid: string,
  result: Omit<QuizResult, "createdAt">
) {
  const ref = doc(db, "users", uid, "results", Date.now().toString())

  await setDoc(ref, {
    ...result,
    createdAt: serverTimestamp(),
  })
}
