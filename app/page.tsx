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

  /** ⭐ クイズ種別を保存 */
  const selectQuiz = (type: string) => {
    localStorage.setItem('quizType', type)
    router.push('/select-mode')
  }

  if (checkingAuth) {
    return <p style={{ textAlign: 'center', marginTop: 40 }}>確認中...</p>
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center' }}>
        クイズ学習アプリ
      </h1>

      <p style={{ textAlign: 'center', marginBottom: 24 }}>
        ようこそ {user?.displayName ?? user?.email} さん
      </p>

      {/* クイズ選択 */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>クイズを選択</h2>

        <Button variant="main" onClick={() => selectQuiz('license')}>
          外国免許切替クイズ
        </Button>

        <Button variant="main" onClick={() => selectQuiz('japanese')}>
          日本語クイズ（準備中）
        </Button>

        <Button variant="main" onClick={() => selectQuiz('safety')}>
          安全教育クイズ（準備中）
        </Button>
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
