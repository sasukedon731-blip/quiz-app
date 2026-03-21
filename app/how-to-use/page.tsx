"use client"

import Link from "next/link"

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* タイトル */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            このアプリの使い方
            <span className="block text-base font-normal text-slate-500 mt-1">
              How to use this app
            </span>
          </h1>

          <p className="mt-3 text-slate-700">
            仕事で使う日本語や資格対策を学べます。
            まずは無料の日本語バトルから始めてください。
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Learn Japanese for work and exams. Start with the free Japanese Battle.
          </p>
        </section>

        {/* 無料・有料 */}
        <section className="grid gap-4 md:grid-cols-2 mb-6">

          {/* 無料 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              無料でできること
            </h2>
            <p className="text-sm text-slate-500 mb-3">
              What you can do for free
            </p>

            <ul className="space-y-2 text-slate-700">
              <li>・日本語バトル（1日1回）</li>
              <li className="text-sm text-slate-500">
                Play once per day
              </li>
            </ul>

            {/* 🔥 強化ボタン */}
            <Link
              href="/game"
              className="mt-6 flex w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-5 text-center text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-lg font-bold">🎮 無料で試す</span>
              <span className="text-xs text-blue-100">Try for free</span>
            </Link>
          </div>

          {/* 有料 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-2">
              有料でできること
            </h2>
            <p className="text-sm text-slate-500 mb-3">
              Paid features
            </p>

            <ul className="space-y-2 text-slate-700">
              <li>・3 / 5 / 7教材</li>
              <li>・業種別学習</li>
              <li>・試験対策</li>
              <li>・AI会話（＋500円）</li>
            </ul>

            {/* 🔥 強化ボタン */}
            <Link
              href="/plans"
              className="mt-6 flex w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-5 text-center text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-lg font-bold">💰 プランを見る</span>
              <span className="text-xs text-gray-300">View plans</span>
            </Link>
          </div>
        </section>

        {/* 使い方 */}
        <section className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <h2 className="text-2xl font-bold mb-1">使い方の流れ</h2>
          <p className="text-sm text-slate-500 mb-4">How it works</p>

          <div className="space-y-4">

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="font-semibold">① 日本語バトル</p>
              <p className="text-sm text-slate-500">
                Free game to check your level
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="font-semibold">② 教材で学習</p>
              <p className="text-sm text-slate-500">
                Study with selected lessons
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="font-semibold">③ 継続</p>
              <p className="text-sm text-slate-500">
                Continue daily
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="font-semibold">④ AI会話</p>
              <p className="text-sm text-slate-500">
                Practice conversation
              </p>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-3xl text-white shadow-lg">

          <h2 className="text-2xl font-bold mb-2">
            もっと学びたい方へ
          </h2>

          <p className="text-sm mb-5">
            有料プランで教材を選んで学習できます。
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">

            <Link
              href="/plans"
              className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-white px-5 py-5 text-blue-700 font-bold shadow-lg hover:scale-[1.02]"
            >
              <span>プランを見る</span>
              <span className="text-xs text-blue-500">View plans</span>
            </Link>

            <Link
              href="/game"
              className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-white px-5 py-5 font-bold hover:scale-[1.02]"
            >
              <span>無料で試す</span>
              <span className="text-xs text-blue-100">Try for free</span>
            </Link>

          </div>
        </section>

      </div>
    </main>
  )
}