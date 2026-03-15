"use client"

import { useState } from "react"

type Props = {
  onGenerate: (args: {
    sourceLanguage: string
    sourceText: string
    scene: string
    politeness: string
  }) => void
  loading?: boolean
}

export default function SpeakingInput({ onGenerate, loading = false }: Props) {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("en")
  const [scene, setScene] = useState("work")
  const [politeness, setPoliteness] = useState("polite")

  const disabled = loading || !text.trim()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <div className="mb-2 text-base font-bold text-slate-800">言語</div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-16 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-5 text-[18px] font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="my">Myanmar</option>
          </select>
        </label>

        <label className="block">
          <div className="mb-2 text-base font-bold text-slate-800">場面</div>
          <select
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            className="h-16 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-5 text-[18px] font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
          >
            <option value="work">Work</option>
            <option value="daily">Daily</option>
            <option value="interview">Interview</option>
          </select>
        </label>
      </div>

      <label className="block">
        <div className="mb-2 text-base font-bold text-slate-800">言いたいこと</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例: HELLO / Nice to meet you / I want to take a day off tomorrow"
          className="min-h-[160px] w-full rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-[22px] font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
        />
      </label>

      <label className="block">
        <div className="mb-2 text-base font-bold text-slate-800">丁寧さ</div>
        <select
          value={politeness}
          onChange={(e) => setPoliteness(e.target.value)}
          className="h-16 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-5 text-[18px] font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
        >
          <option value="polite">ていねい</option>
          <option value="casual">ややカジュアル</option>
          <option value="formal">かなりていねい</option>
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
        className="flex h-16 w-full items-center justify-center rounded-[24px] bg-blue-600 px-5 text-lg font-black text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "日本語候補を作成中..." : "日本語候補を2つ作る"}
      </button>
    </div>
  )
}