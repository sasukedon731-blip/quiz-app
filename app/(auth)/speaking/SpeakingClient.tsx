"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import SpeakingInput from "./components/SpeakingInput"
import CandidateCard from "./components/CandidateCard"
import SpeakingRecorder from "./components/SpeakingRecorder"
import EvaluationCard from "./components/EvaluationCard"
import SpeakingTopBar from "./components/SpeakingTopBar"
import SpeakingBottomNav from "./components/SpeakingBottomNav"

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

function StepHeader({
  step,
  title,
  sub,
}: {
  step: number
  title: string
  sub: string
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
        {step}
      </div>
      <div>
        <div className="text-[11px] font-semibold tracking-wide text-slate-500">STEP {step}</div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{sub}</p>
      </div>
    </div>
  )
}

export default function SpeakingClient() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [transcript, setTranscript] = useState("")
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState("")

  const selectedId = selected?.id ?? ""
  const selectedIndex = useMemo(
    () => candidates.findIndex((c) => c.id === selectedId),
    [candidates, selectedId]
  )

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
        throw new Error(json?.error || "日本語候補の作成に失敗しました")
      }

      if (!Array.isArray(json?.candidates)) {
        throw new Error("候補データの形式が正しくありません")
      }

      setCandidates(json.candidates)
      if (json.candidates.length > 0) {
        setSelected(json.candidates[0])
      }
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
      setEvaluation(null)
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

  function resetPractice() {
    setSelected(candidates[0] ?? null)
    setTranscript("")
    setEvaluation(null)
    setError("")
  }

  return (
    <>
      <SpeakingTopBar />

      <main className="mx-auto w-full max-w-2xl px-4 py-5 pb-28 sm:px-6">
        <div className="mb-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-sm">
          <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            AI日本語スピーキング
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">話す練習をしよう</h1>
          <p className="mt-2 text-sm leading-6 text-white/90">
            言いたいことを入れて、日本語候補を2つから選び、録音してAI評価まで進めます。
          </p>
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <StepHeader
              step={1}
              title="言いたいことを入れる"
              sub="母国語で入力すると、すぐに日本語候補を2つ作ります。"
            />
            <SpeakingInput onGenerate={generate} loading={loading} />
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}

          {candidates.length > 0 ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <StepHeader
                step={2}
                title="候補をえらぶ"
                sub="おすすめ2つだけ表示します。言いやすい方を選んでください。"
              />

              <div className="space-y-3">
                {candidates.map((c, index) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    selected={selectedId === c.id}
                    ranking={index + 1}
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
          ) : null}

          {selected ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <StepHeader
                step={3}
                title="話してみよう"
                sub="大きいボタンを押して話し、終わったらもう一度押して停止します。"
              />

              <SpeakingRecorder
                key={selected.id}
                target={selected.japanese}
                reading={selected.reading}
                note={selected.note}
                onTranscript={(t: string) => {
                  setTranscript(t)
                  void evaluate(t)
                }}
                onError={(message: string) => setError(message)}
              />
            </section>
          ) : null}

          {transcript ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <StepHeader
                step={4}
                title="認識結果とAI評価"
                sub="自分の発話がどう認識されたか、何を直せばよいかが分かります。"
              />

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-1 text-xs font-semibold text-slate-500">認識された日本語</div>
                <div className="text-lg font-semibold text-slate-900">{transcript}</div>
              </div>

              {evaluating ? (
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  AIが評価中です...
                </div>
              ) : evaluation ? (
                <div className="mt-4">
                  <EvaluationCard result={evaluation} />
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={resetPractice}
                  className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800"
                >
                  もう一回練習する
                </button>
                <Link
                  href="/"
                  className="flex h-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white"
                >
                  TOPに戻る
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <SpeakingBottomNav />
    </>
  )
}
