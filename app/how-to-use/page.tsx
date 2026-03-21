"use client"

import Link from "next/link"

function PrimaryButton({
  href,
  icon,
  labelJa,
  labelEn,
}: {
  href: string
  icon: string
  labelJa: string
  labelEn: string
}) {
  return (
    <Link
      href={href}
      className="
        mt-6 block w-full rounded-2xl
        border-2 border-blue-700
        bg-blue-600
        px-5 py-4
        text-white
        shadow-[0_10px_24px_rgba(37,99,235,0.35)]
        transition
        hover:-translate-y-0.5 hover:bg-blue-700
        active:translate-y-0
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-xl">
            {icon}
          </div>
          <div className="text-left">
            <div className="text-base font-extrabold">{labelJa}</div>
            <div className="text-xs text-blue-100">{labelEn}</div>
          </div>
        </div>
        <div className="text-2xl font-bold leading-none">›</div>
      </div>
    </Link>
  )
}

function DarkButton({
  href,
  icon,
  labelJa,
  labelEn,
}: {
  href: string
  icon: string
  labelJa: string
  labelEn: string
}) {
  return (
    <Link
      href={href}
      className="
        mt-6 block w-full rounded-2xl
        border-2 border-slate-950
        bg-slate-900
        px-5 py-4
        text-white
        shadow-[0_10px_24px_rgba(15,23,42,0.35)]
        transition
        hover:-translate-y-0.5 hover:bg-slate-800
        active:translate-y-0
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl">
            {icon}
          </div>
          <div className="text-left">
            <div className="text-base font-extrabold">{labelJa}</div>
            <div className="text-xs text-slate-300">{labelEn}</div>
          </div>
        </div>
        <div className="text-2xl font-bold leading-none">›</div>
      </div>
    </Link>
  )
}

function WhiteCTAButton({
  href,
  labelJa,
  labelEn,
}: {
  href: string
  labelJa: string
  labelEn: string
}) {
  return (
    <Link
      href={href}
      className="
        flex-1 rounded-2xl bg-white px-5 py-4
        text-center text-blue-700
        border-2 border-white
        shadow-[0_10px_24px_rgba(255,255,255,0.2)]
        transition hover:-translate-y-0.5 hover:bg-blue-50
      "
    >
      <div className="text-base font-extrabold">{labelJa}</div>
      <div className="mt-1 text-xs text-blue-500">{labelEn}</div>
    </Link>
  )
}

function OutlineCTAButton({
  href,
  labelJa,
  labelEn,
}: {
  href: string
  labelJa: string
  labelEn: string
}) {
  return (
    <Link
      href={href}
      className="
        flex-1 rounded-2xl border-2 border-white
        bg-white/10 px-5 py-4
        text-center text-white
        shadow-[0_10px_24px_rgba(0,0,0,0.12)]
        transition hover:-translate-y-0.5 hover:bg-white/20
      "
    >
      <div className="text-base font-extrabold">{labelJa}</div>
      <div className="mt-1 text-xs text-blue-100">{labelEn}</div>
    </Link>
  )
}

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            このアプリの使い方
            <span className="mt-1 block text-base font-normal text-slate-500">
              How to use this app
            </span>
          </h1>

          <p className="mt-3 text-slate-700">
            仕事で使う日本語や資格対策を学べます。まずは無料の日本語バトルから始めてください。
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Learn Japanese for work and exams. Start with the free Japanese Battle.
          </p>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-slate-900">無料でできること</h2>
            <p className="mb-3 text-sm text-slate-500">What you can do for free</p>

            <ul className="space-y-2 text-slate-700">
              <li>・日本語バトル（1日1回）</li>
              <li className="text-sm text-slate-500">Play once per day</li>
            </ul>

            <PrimaryButton
              href="/game"
              icon="🎮"
              labelJa="無料で試す"
              labelEn="Try for free"
            />
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-slate-900">有料でできること</h2>
            <p className="mb-3 text-sm text-slate-500">Paid features</p>

            <ul className="space-y-2 text-slate-700">
              <li>・3 / 5 / 7教材</li>
              <li>・業種別学習</li>
              <li>・試験対策</li>
              <li>・AI会話（＋500円）</li>
            </ul>

            <DarkButton
              href="/plans"
              icon="💰"
              labelJa="プランを見る"
              labelEn="View plans"
            />
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-2xl font-bold text-slate-900">使い方の流れ</h2>
          <p className="mb-4 text-sm text-slate-500">How it works</p>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold">① 日本語バトル</p>
              <p className="text-sm text-slate-500">Free game to check your level</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold">② 教材で学習</p>
              <p className="text-sm text-slate-500">Study with selected lessons</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold">③ 継続</p>
              <p className="text-sm text-slate-500">Continue daily</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold">④ AI会話</p>
              <p className="text-sm text-slate-500">Practice conversation</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <h2 className="mb-2 text-2xl font-bold">もっと学びたい方へ</h2>
          <p className="mb-5 text-sm">
            有料プランで教材を選んで学習できます。
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <WhiteCTAButton
              href="/plans"
              labelJa="プランを見る"
              labelEn="View plans"
            />
            <OutlineCTAButton
              href="/game"
              labelJa="無料で試す"
              labelEn="Try for free"
            />
          </div>
        </section>
      </div>
    </main>
  )
}