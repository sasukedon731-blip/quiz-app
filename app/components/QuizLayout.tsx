"use client"

import { ReactNode } from "react"
import Link from "next/link"

type Props = {
  title: string
  children: ReactNode
}

export default function QuizLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-6">
      {/* ヘッダー */}
      <header className="w-full max-w-md text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </header>

      {/* メイン */}
      <main className="w-full max-w-md bg-white rounded-xl shadow p-6">
        {children}
      </main>

      {/* フッターボタン */}
      <footer className="w-full max-w-md mt-6 flex flex-col gap-3">
        <Link href="/mypage">
          <button className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">
            マイページ
          </button>
        </Link>

        <Link href="/">
          <button className="w-full py-3 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400">
            TOPへ戻る
          </button>
        </Link>
      </footer>
    </div>
  )
}
