import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCCMY1jkgZJY6nl6a68Gcq8GZ_WWuBZw0Q",
  authDomain: "foreign-license-quiz.firebaseapp.com",
  projectId: "foreign-license-quiz",
  storageBucket: "foreign-license-quiz.firebasestorage.app",
  messagingSenderId: "548856782328",
  appId: "1:548856782328:web:cf66ef91887b9119ba8a0d"
}

// ★ Next.js対策（超重要）
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// 認証（今まで通り）
export const auth = getAuth(app)

// ★ 追加：Firestore
export const db = getFirestore(app)
