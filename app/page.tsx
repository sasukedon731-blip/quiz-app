'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from './lib/firebase'
import Button from './components/Button'


export default function Home() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) {
        router.replace('/login')
      } else {
        setUser(u)
        setCheckingAuth(false)
      }
    })
    return () => unsub()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.replace('/login')
  }

  if (checkingAuth) {
    return <p style={{ textAlign: 'center', marginTop: 40 }}>確認中...</p>
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center' }}>
        外国免許切替クイズ
      </h1>

      <p style={{ textAlign: 'center', marginBottom: 24 }}>
        ようこそ {user ? (user.displayName ?? user.email) : ''} さん
      </p>

      {/* クイズモード */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>クイズモード</h2>

        <Link href="/normal">
          <Button variant="main">通常モード</Button>
        </Link>

        <Link href="/exam">
          <Button variant="main">模擬試験</Button>
        </Link>

        <Link href="/review">
          <Button variant="main">復習モード</Button>
        </Link>
      </div>

      {/* その他 */}
      <div className="card">
        <Link href="/mypage">
          <Button variant="success">マイページ</Button>
        </Link>

        <Button variant="accent" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>
    </div>
  )
}
