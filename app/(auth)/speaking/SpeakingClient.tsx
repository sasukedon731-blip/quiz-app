"use client"

import { useState } from "react"
import SpeakingInput from "./components/SpeakingInput"
import CandidateCard from "./components/CandidateCard"
import SpeakingRecorder from "./components/SpeakingRecorder"
import EvaluationCard from "./components/EvaluationCard"

type Candidate = {
  id: string
  japanese: string
  reading: string
  note: string
}

type EvaluationResult = {
  overallResult: string
  scores: {
    meaning: number
    naturalness: number
    politeness: number
  }
  goodPoints?: string[]
  fixPoints?: string[]
  recommended?: string
  shortFeedback?: string
}

export default function SpeakingClient() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [transcript, setTranscript] = useState("")
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState("")

  async function generate(data: {
    sourceLanguage: string
    sourceText: string
    scene: string
    politeness: string
  }) {
    try {
      setLoading(true)
      setError("")
      setSelected(null)
      setEvaluation(null)
      setTranscript("")
      setCandidates([])

      const res = await fetch("/api/speaking/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || "日本語変換に失敗しました")
      }

      if (!Array.isArray(json?.candidates)) {
        throw new Error("候補データの形式が正しくありません")
      }

      setCandidates(json.candidates)
    } catch (err) {
      console.error("generate error:", err)
      setError(err instanceof Error ? err.message : "エラーが発生しました")
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  async function evaluate(spoken: string) {
    if (!selected) return

    try {
      setEvaluating(true)
      setError("")
      setEvaluation(null)

      const res = await fetch("/api/speaking/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetText: selected.japanese,
          spokenTranscript: spoken,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || "評価に失敗しました")
      }

      setEvaluation(json)
    } catch (err) {
      console.error("evaluate error:", err)
      setError(err instanceof Error ? err.message : "評価中にエラーが発生しました")
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          AI日本語スピーキング
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          母国語から日本語を作って、話して、評価を受けよう
        </h1>
        <p className="text-sm leading-6 text-slate-600 sm:text-base">
          ①入力 → ②候補選択 → ③話してみる → ④AI評価 の流れで練習できます。
        </p>
      </div>

      <SpeakingInput onGenerate={generate} loading={loading} />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {candidates.length > 0 && (
        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              2
            </div>
            <div>
              <h2 className="font-bold text-slate-900">日本語候補をえらぶ</h2>
              <p className="text-sm text-slate-500">一番言いやすい文を選んで練習します。</p>
            </div>
          </div>

          <div className="grid gap-3">
            {candidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                selected={selected?.id === c.id}
                onSelect={() => {
                  setSelected(c)
                  setTranscript("")
                  setEvaluation(null)
                  setError("")
                }}
              />
            ))}
          </div>
        </section>
      )}

      {selected && (
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
              3
            </div>
            <div>
              <h2 className="font-bold text-slate-900">話してみよう</h2>
              <p className="text-sm text-slate-500">録音を開始して、文を読んだら停止してください。</p>
            </div>
          </div>

          <SpeakingRecorder
            target={selected.japanese}
            reading={selected.reading}
            onTranscript={(t: string) => {
              setTranscript(t)
              evaluate(t)
            }}
          />

          {transcript && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-1 text-xs font-semibold tracking-wide text-slate-500">
                認識結果
              </div>
              <div className="text-base font-medium text-slate-900">{transcript}</div>
            </div>
          )}

          {evaluating && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              AIが評価しています...
            </div>
          )}
        </section>
      )}

      {evaluation && (
        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
              4
            </div>
            <div>
              <h2 className="font-bold text-slate-900">AI評価</h2>
              <p className="text-sm text-slate-500">伝わりやすさ・自然さ・丁寧さを見ます。</p>
            </div>
          </div>
          <EvaluationCard result={evaluation} />
        </section>
      )}
    </div>
  )
}
