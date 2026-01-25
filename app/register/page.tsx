"use client"

import { useState } from "react"
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { auth } from "../lib/firebase"
import { useRouter } from "next/navigation"

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

    try {
      // ユーザー作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      // ユーザーネームを保存
      await updateProfile(userCredential.user, {
        displayName: username,
      })

      router.push("/") // 登録成功 → TOPへ
    } catch (err: any) {
      console.error(err)
      setError(err.code ?? "登録に失敗しました")
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
