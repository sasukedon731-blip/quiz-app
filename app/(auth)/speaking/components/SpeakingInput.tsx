"use client"

import { useState } from "react"

type SpeakingInputProps = {
  onGenerate: (data: {
    sourceLanguage: string
    sourceText: string
    scene: string
    politeness: string
  }) => void
  loading?: boolean
}

export default function SpeakingInput({ onGenerate, loading = false }: SpeakingInputProps) {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("en")
  const [scene, setScene] = useState("work")
  const [politeness, setPoliteness] = useState("polite")

  const disabled = loading || !text.trim()

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
          1
        </div>
        <div>
          <h2 className="font-bold text-slate-900">母国語で入力する</h2>
          <p className="text-sm text-slate-500">短く入力すると使いやすい日本語候補を2つ出します。</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">言語</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="my">Myanmar</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">場面</span>
          <select
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="work">仕事</option>
            <option value="daily">日常</option>
            <option value="interview">面接</option>
          </select>
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium text-slate-700">言いたいこと</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例: I will be 10 minutes late because the train is delayed."
          rows={4}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium text-slate-700">丁寧さ</span>
        <select
          value={politeness}
          onChange={(e) => setPoliteness(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="polite">ていねい</option>
          <option value="casual">カジュアル</option>
        </select>
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onGenerate({
            sourceLanguage: language,
            sourceText: text,
            scene,
            politeness,
          })
        }
        className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-4 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "日本語候補を作成中..." : "日本語候補を作る"}
      </button>
    </section>
  )
}
