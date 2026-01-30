'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from './lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

import Button from './components/Button'
import Card from './components/Card'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  // ログインユーザー監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return () => unsubscribe()
  }, [])

  return (
    <main className="container">
      {/* タイトル */}
      <h1 style={{ textAlign: 'center', marginBottom: 8 }}>
        クイズ学習アプリ
      </h1>

      {/* ユーザー名 */}
      <p style={{ textAlign: 'center', marginBottom: 32 }}>
        ようこそ{' '}
        {user?.displayName
          ? `${user.displayName} さん`
          : user?.email
          ? user.email
          : 'ゲスト さん'}
      </p>

      {/* クイズ選択 */}
      <Card>
        <h2 style={{ marginBottom: 16 }}>クイズを選択</h2>

        {/* 外国免許切替 */}
        <Button
          variant="main"
          onClick={() => router.push('/select-mode?type=gaikoku')}
        >
          外国免許切替クイズ
        </Button>

        {/* 日本語N4 */}
        <Button
          variant="main"
          onClick={() => router.push('/select-mode?type=japanese-n4')}
        >
          日本語N4クイズ
        </Button>

        {/* 準備中 */}
        <Button disabled>
          安全教育クイズ（準備中）
        </Button>
      </Card>

      {/* マイページ・ログアウト */}
      <Card>
        <Button
          variant="success"
          onClick={() => router.push('/mypage')}
        >
          マイページ
        </Button>

        <Button
          variant="accent"
          onClick={() => auth.signOut()}
        >
          ログアウト
        </Button>
      </Card>
    </main>
  )
}
