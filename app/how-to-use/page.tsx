"use client"

import Link from "next/link"

const steps = [
  {
    title: "1. まずは無料で試す",
    body: "日本語バトルは無料で1日1回プレイできます。まずはゲームで、自分の日本語力をチェックしましょう。",
    emoji: "🎮",
  },
  {
    title: "2. 教材を選んで学習する",
    body: "有料プランでは、業種に合わせて教材を選び、1ヶ月学習できます。3教材・5教材・7教材から選べます。",
    emoji: "📚",
  },
  {
    title: "3. 毎日少しずつ続ける",
    body: "問題学習、試験対策、実践的な内容を少しずつ進めることで、仕事で使う日本語が身につきます。",
    emoji: "🗓️",
  },
  {
    title: "4. AI会話で実践する",
    body: "AI会話は月500円の追加オプションです。実際の会話を想定した練習ができます。",
    emoji: "🗣️",
  },
]

const tips = [
  "最初は日本語バトルで今の力を確認する",
  "必要な業種の教材を選ぶ",
  "毎日5分でも続ける",
  "苦手なところをくり返し練習する",
]

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            使い方ガイド
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
            このアプリの使い方
          </h1>

          <p className="text-base leading-7 text-slate-600">
            このアプリでは、仕事で使う日本語や資格対策を学べます。
            まずは無料の日本語バトルから始めて、もっと学びたい方はプランから教材を選んで進めます。
          </p>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold text-slate-900">無料でできること</h2>
            <ul className="space-y-2 text-slate-600">
              <li>・日本語バトルを1日1回プレイ</li>
              <li>・アプリの雰囲気を確認</li>
              <li>・自分の日本語力をチェック</li>
            </ul>

            <Link
              href="/game"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              無料で試す
            </Link>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold text-slate-900">有料でできること</h2>
            <ul className="space-y-2 text-slate-600">
              <li>・3 / 5 / 7教材を選んで学習</li>
              <li>・業種ごとの教材を利用</li>
              <li>・試験対策や実践学習が可能</li>
              <li>・AI会話は月500円で追加可能</li>
            </ul>

            <Link
              href="/plans"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              プランを見る
            </Link>
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-2xl font-bold text-slate-900">使い方の流れ</h2>

          <div className="grid gap-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="text-2xl">{step.emoji}</div>
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                </div>
                <p className="text-sm leading-7 text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">おすすめの使い方</h2>

          <div className="rounded-2xl bg-amber-50 p-4">
            <ul className="space-y-2 text-sm leading-7 text-slate-700">
              {tips.map((tip) => (
                <li key={tip}>・{tip}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-sm">
          <h2 className="mb-3 text-2xl font-bold">もっと学びたい方へ</h2>
          <p className="mb-5 text-sm leading-7 text-blue-50">
            有料プランでは、業種に合わせて教材を選び、1ヶ月学習できます。
            会話練習をしたい方は、AI会話オプションも追加できます。
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/plans"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              プランを見る
            </Link>

            <Link
              href="/game"
              className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              まずは無料で試す
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}