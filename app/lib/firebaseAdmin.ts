// app/lib/firebaseAdmin.ts
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON)")
  }
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON")
  }
}

export function getAdminApp() {
  if (getApps().length) return getApps()[0]!
  const serviceAccount = getServiceAccount()

  return initializeApp({
    credential: cert(serviceAccount),
  })
}

export const adminAuth = () => getAuth(getAdminApp())
export const adminDb = () => getFirestore(getAdminApp())
