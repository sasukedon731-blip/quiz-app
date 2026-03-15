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
  const [playingId, setPlayingId] = useState<string | null>(null)

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
      if (!res.ok) throw new Error(json?.error || "日本語変換に失敗しました")
      if (!Array.isArray(json?.candidates)) throw new Error("候補データの形式が正しくありません")
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
      setError("")
      setEvaluating(true)

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
      if (!res.ok) throw new Error(json?.error || "評価に失敗しました")
      setEvaluation(json)
    } catch (err) {
      console.error("evaluate error:", err)
      setError(err instanceof Error ? err.message : "評価中にエラーが発生しました")
    } finally {
      setEvaluating(false)
    }
  }

  async function playTts(candidate: Candidate) {
    try {
      setPlayingId(candidate.id)
      const res = await fetch("/api/speaking/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: candidate.japanese }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || "音声再生に失敗しました")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => {
        URL.revokeObjectURL(url)
        setPlayingId(null)
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        setPlayingId(null)
      }
      await audio.play()
    } catch (err) {
      setPlayingId(null)
      setError(err instanceof Error ? err.message : "音声再生に失敗しました")
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[28px] bg-slate-900 px-6 py-7 text-white shadow-lg md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                AI会話トレーニング
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">話せる日本語を、すぐ練習</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                母国語で入力 → AIが自然な日本語を提案 → 音声で発話 → AIが評価。
                1画面で完結するスピーキング教材です。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
              <div className="rounded-3xl bg-white/10 p-4">
                <div className="text-xs text-slate-300">候補生成</div>
                <div className="mt-1 text-2xl font-black">3文</div>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <div className="text-xs text-slate-300">評価軸</div>
                <div className="mt-1 text-2xl font-black">3項目</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SpeakingInput onGenerate={generate} loading={loading} />

            {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            {candidates.length > 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      STEP 2
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">AI候補から1つ選ぶ</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">まずはおすすめ文から練習すると進めやすいです。</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {candidates.map((candidate, index) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      recommended={index === 0}
                      selected={selected?.id === candidate.id}
                      onSelect={() => {
                        setSelected(candidate)
                        setEvaluation(null)
                        setTranscript("")
                      }}
                      onPlay={() => playTts(candidate)}
                      playing={playingId === candidate.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {selected ? (
              <SpeakingRecorder
                target={selected.japanese}
                onTranscript={(spokenText: string) => {
                  setTranscript(spokenText)
                  evaluate(spokenText)
                }}
              />
            ) : null}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="text-sm font-bold text-slate-900">学習の流れ</div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">1. 母国語で入力</div>
                <div className="rounded-2xl bg-slate-50 p-4">2. 日本語候補を選択</div>
                <div className="rounded-2xl bg-slate-50 p-4">3. 音声で話す</div>
                <div className="rounded-2xl bg-slate-50 p-4">4. AI評価を確認</div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="text-sm font-bold text-slate-900">選択中の文</div>
              {selected ? (
                <>
                  <div className="mt-3 text-lg font-bold leading-8 text-slate-900">{selected.japanese}</div>
                  <div className="mt-2 text-sm text-slate-500">{selected.reading}</div>
                  <div className="mt-3 text-sm leading-6 text-slate-600">{selected.note}</div>
                </>
              ) : (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                  まずはAI候補から1文選んでください。
                </div>
              )}
            </section>

            {transcript ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="text-sm font-bold text-slate-900">認識結果</div>
                <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{transcript}</div>
                {evaluating ? <div className="mt-3 text-xs text-slate-500">AIが評価中です...</div> : null}
              </section>
            ) : null}

            {evaluation ? <EvaluationCard result={evaluation} /> : null}
          </div>
        </div>
      </div>
    </main>
  )
}
