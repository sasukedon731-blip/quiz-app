// lib/firestore.ts

// Firebase Firestore 用設定
import { getFirestore } from "firebase/firestore"
import { initializeApp } from "firebase/app"

// Firebase 設定（firebase.ts と同じでもOK）
const firebaseConfig = {
  apiKey: "AIzaSyCCMY1jkgZJY6nl6a68Gcq8GZ_WWuBZw0Q",
  authDomain: "foreign-license-quiz.firebaseapp.com",
  projectId: "foreign-license-quiz",
  storageBucket: "foreign-license-quiz.firebasestorage.app",
  messagingSenderId: "548856782328",
  appId: "1:548856782328:web:cf66ef91887b9119ba8a0d"
}

// Firebase App 初期化
const app = initializeApp(firebaseConfig)

// Firestore インスタンスをエクスポート
export const db = getFirestore(app)
