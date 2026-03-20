"use client"

import Link from "next/link"

const steps = [
  {
    titleJa: "1. まずは無料で試す",
    titleEn: "Try for free first",
    bodyJa:
      "日本語バトルは無料で1日1回プレイできます。まずはゲームで、自分の日本語力をチェックしましょう。",
    bodyEn:
      "You can play Japanese Battle once per day for free. Start here and check your current Japanese level.",
    emoji: "🎮",
  },
  {
    titleJa: "2. 教材を選んで学習する",
    titleEn: "Choose lessons and study",
    bodyJa:
      "有料プランでは、業種に合わせて教材を選び、1ヶ月学習できます。3教材・5教材・7教材から選べます。",
    bodyEn:
      "With a paid plan, you can choose lessons that match your job field and study for one month. You can choose 3, 5, or 7 lessons.",
    emoji: "📚",
  },
  {
    titleJa: "3. 毎日少しずつ続ける",
    titleEn: "Study a little every day",
    bodyJa:
      "問題学習、試験対策、実践的な内容を少しずつ進めることで、仕事で使う日本語が身につきます。",
    bodyEn:
      "By studying questions, exam content, and practical materials a little every day, you can improve the Japanese you use at work.",
    emoji: "🗓️",
  },
  {
    titleJa: "4. AI会話で実践する",
    titleEn: "Practice with AI conversation",
    bodyJa:
      "AI会話は月500円の追加オプションです。実際の会話を想定した練習ができます。",
    bodyEn:
      "AI conversation is an extra option for 500 yen per month. You can practice real conversation situations.",
    emoji: "🗣️",
  },
]

const tips = [
  {
    ja: "最初は日本語バトルで今の力を確認する",
    en: "First, check your level with Japanese Battle",
  },
  {
    ja: "必要な業種の教材を選ぶ",
    en: "Choose lessons for your work field",
  },
  {
    ja: "毎日5分でも続ける",
    en: "Continue even for 5 minutes a day",
  },
  {
    ja: "苦手なところをくり返し練習する",
    en: "Repeat the parts that are difficult for you",
  },
]

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            使い方ガイド
            <span className="ml-2 text-xs font-normal text-blue-600">
              How to use
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
            このアプリの使い方
            <span className="mt-1 block text-base font-normal text-slate-500">
              How to use this app
            </span>
          </h1>

          <p className="text-base leading-7 text-slate-700">
            このアプリでは、仕事で使う日本語や資格対策を学べます。
            まずは無料の日本語バトルから始めて、もっと学びたい方はプランから教材を選んで進めます。
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            In this app, you can study Japanese for work and exam preparation.
            Start with the free Japanese Battle, and if you want to study more,
            choose a plan and lessons.
          </p>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-xl font-bold text-slate-900">
              無料でできること
            </h2>
            <p className="mb-3 text-sm text-slate-500">What you can do for free</p>

            <ul className="space-y-3 text-slate-700">
              <li>
                <div>・日本語バトルを1日1回プレイ</div>
                <div className="text-sm text-slate-500">
                  Play Japanese Battle once per day
                </div>
              </li>
              <li>
                <div>・アプリの雰囲気を確認</div>
                <div className="text-sm text-slate-500">
                  Check how the app works
                </div>
              </li>
              <li>
                <div>・自分の日本語力をチェック</div>
                <div className="text-sm text-slate-500">
                  Check your Japanese level
                </div>
              </li>
            </ul>

            <Link
              href="/game"
              className="mt-6 inline-flex w-full flex-col items-center justify-center rounded-2xl bg-blue-600 px-4 py-4 text-center text-base font-semibold text-white transition hover:bg-blue-700"
            >
              <span>無料で試す</span>
              <span className="mt-1 text-xs font-normal text-blue-100">
                Try for free
              </span>
            </Link>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-xl font-bold text-slate-900">
              有料でできること
            </h2>
            <p className="mb-3 text-sm text-slate-500">What you can do with a paid plan</p>

            <ul className="space-y-3 text-slate-700">
              <li>
                <div>・3 / 5 / 7教材を選んで学習</div>
                <div className="text-sm text-slate-500">
                  Choose 3 / 5 / 7 lessons and study
                </div>
              </li>
              <li>
                <div>・業種ごとの教材を利用</div>
                <div className="text-sm text-slate-500">
                  Use lessons for your job field
                </div>
              </li>
              <li>
                <div>・試験対策や実践学習が可能</div>
                <div className="text-sm text-slate-500">
                  Study for exams and practical situations
                </div>
              </li>
              <li>
                <div>・AI会話は月500円で追加可能</div>
                <div className="text-sm text-slate-500">
                  AI conversation can be added for 500 yen/month
                </div>
              </li>
            </ul>

            <Link
              href="/plans"
              className="mt-6 inline-flex w-full flex-col items-center justify-center rounded-2xl bg-slate-900 px-4 py-4 text-center text-base font-semibold text-white transition hover:bg-slate-800"
            >
              <span>プランを見る</span>
              <span className="mt-1 text-xs font-normal text-slate-300">
                View plans
              </span>
            </Link>
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-2xl font-bold text-slate-900">使い方の流れ</h2>
          <p className="mb-5 text-sm text-slate-500">How it works</p>

          <div className="grid gap-4">
            {steps.map((step) => (
              <div
                key={step.titleJa}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-2 flex items-start gap-3">
                  <div className="text-2xl">{step.emoji}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {step.titleJa}
                    </h3>
                    <p className="text-sm text-slate-500">{step.titleEn}</p>
                  </div>
                </div>

                <p className="text-sm leading-7 text-slate-700">{step.bodyJa}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.bodyEn}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-2xl font-bold text-slate-900">
            おすすめの使い方
          </h2>
          <p className="mb-4 text-sm text-slate-500">Recommended way to study</p>

          <div className="rounded-2xl bg-amber-50 p-4">
            <ul className="space-y-3">
              {tips.map((tip) => (
                <li key={tip.ja}>
                  <div className="text-sm leading-7 text-slate-800">・{tip.ja}</div>
                  <div className="text-sm leading-6 text-slate-500">{tip.en}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-sm">
          <h2 className="mb-1 text-2xl font-bold">もっと学びたい方へ</h2>
          <p className="mb-1 text-sm text-blue-100">For users who want to study more</p>

          <p className="mb-5 text-sm leading-7 text-blue-50">
            有料プランでは、業種に合わせて教材を選び、1ヶ月学習できます。
            会話練習をしたい方は、AI会話オプションも追加できます。
          </p>
          <p className="mb-5 text-sm leading-6 text-blue-100">
            With a paid plan, you can choose lessons that match your job field
            and study for one month. If you want conversation practice, you can
            also add the AI conversation option.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/plans"
              className="inline-flex flex-1 flex-col items-center justify-center rounded-2xl bg-white px-5 py-4 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <span>プランを見る</span>
              <span className="mt-1 text-xs font-normal text-blue-500">
                View plans
              </span>
            </Link>

            <Link
              href="/game"
              className="inline-flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/40 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <span>まずは無料で試す</span>
              <span className="mt-1 text-xs font-normal text-blue-100">
                Try for free first
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}