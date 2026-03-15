"use client"

import { useMemo, useState } from "react"

type SpeakingInputProps = {
  loading?: boolean
  onGenerate: (payload: {
    sourceLanguage: string
    sourceText: string
    scene: string
    politeness: string
  }) => void
}

const languageOptions = [
  { value: "en", label: "English" },
  { value: "id", label: "Bahasa Indonesia" },
  { value: "my", label: "Myanmar" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "ne", label: "नेपाली" },
  { value: "zh", label: "中文" },
]

const sceneOptions = [
  { value: "work", label: "仕事" },
  { value: "daily", label: "日常" },
  { value: "interview", label: "面接" },
]

const politenessOptions = [
  { value: "casual", label: "カジュアル" },
  { value: "polite", label: "ていねい" },
  { value: "business", label: "ビジネス" },
]

const exampleByScene: Record<string, string[]> = {
  work: [
    "Please teach me how to use this machine.",
    "Can I leave early today?",
    "I finished the task.",
  ],
  daily: [
    "I want to buy this.",
    "Where is the station?",
    "Please wait a moment.",
  ],
  interview: [
    "I have experience in manufacturing.",
    "I want to work in Japan for a long time.",
    "I can work night shifts.",
  ],
}

export default function SpeakingInput({ onGenerate, loading = false }: SpeakingInputProps) {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("en")
  const [scene, setScene] = useState("work")
  const [politeness, setPoliteness] = useState("polite")

  const examples = useMemo(() => exampleByScene[scene] ?? exampleByScene.work, [scene])

  const submit = () => {
    if (!text.trim() || loading) return
    onGenerate({
      sourceLanguage: language,
      sourceText: text.trim(),
      scene,
      politeness,
    })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            STEP 1
          </div>
          <h2 className="text-xl font-bold text-slate-900">言いたいことを母国語で入力</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            AIが場面に合った自然な日本語を3つ提案します。
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">言語</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">場面</span>
          <select
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          >
            {sceneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">丁寧さ</span>
          <select
            value={politeness}
            onChange={(e) => setPoliteness(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          >
            {politenessOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">入力文</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例: Please teach me how to use this machine."
            rows={5}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setText(example)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs leading-5 text-slate-500">
          仕事・日常・面接などの場面に合わせて、日本語の自然さを上げます。
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={loading || !text.trim()}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "日本語候補を作成中..." : "日本語候補をつくる"}
        </button>
      </div>
    </section>
  )
}
