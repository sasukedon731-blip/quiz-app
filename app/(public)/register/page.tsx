"use client"

import { useState } from "react"
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"

import { auth, db } from "@/app/lib/firebase"

export default function RegisterPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError("")
    setLoading(true)

    if (!username) {
      setError("ユーザーネームを入力してください")
      setLoading(false)
      return
    }
    if (!email) {
      setError("メールアドレスを入力してください")
      setLoading(false)
      return
    }
    if (!password || password.length < 6) {
      setError("パスワードは6文字以上で入力してください")
      setLoading(false)
      return
    }

    try {
      // 1) Firebase Auth にユーザー作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      // 2) Auth のプロフィールにユーザーネームを保存
      await updateProfile(userCredential.user, {
        displayName: username,
      })

      const uid = userCredential.user.uid

      // 3) Firestore に users/{uid} を作成（プラン運用の初期値もここで入れる）
      await setDoc(doc(db, "users", uid), {
        email: userCredential.user.email ?? email,
        displayName: username,
        role: "user",

        // ✅ プラン・権限（最小構成）
        plan: "free",
        entitledQuizTypes: ["gaikoku-license"],
        selectedQuizTypes: ["gaikoku-license"],

        // ✅ 1ヶ月ごとの変更制限（初回はすぐ変更OK扱い）
        // select-quizzes側で「今 < nextChangeAllowedAt」ならロックする設計
        nextChangeAllowedAt: serverTimestamp(),

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // 登録成功 → TOPへ
      router.push("/")
    } catch (err: any) {
      console.error(err)
      // Firebase Auth の代表的なエラーメッセージを日本語に寄せる（最低限）
      const code = err?.code ?? ""
      if (code === "auth/email-already-in-use") {
        setError("このメールアドレスは既に登録されています")
      } else if (code === "auth/invalid-email") {
        setError("メールアドレスの形式が正しくありません")
      } else if (code === "auth/weak-password") {
        setError("パスワードが弱すぎます（6文字以上）")
      } else {
        setError(code || "登録に失敗しました")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h1>新規登録</h1>

      {/* ユーザーネーム */}
      <input
        type="text"
        placeholder="ユーザーネーム"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {/* メールアドレス */}
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {/* パスワード */}
      <input
        type="password"
        placeholder="パスワード（6文字以上）"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#4caf50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontWeight: "bold",
        }}
      >
        {loading ? "登録中..." : "新規登録"}
      </button>

      <p style={{ marginTop: "15px" }}>
        すでにアカウントをお持ちですか？
        <br />
        <a href="/login">ログインはこちら</a>
      </p>
    </div>
  )
}
