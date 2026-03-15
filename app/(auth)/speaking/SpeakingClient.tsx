"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import AppHeader from "@/app/components/AppHeader"
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

function StepBadge({ step }: { step: number }) {
  return (
    <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-slate-900 px-3 text-sm font-bold text-white">
      {step}
    </div>
  )
}

export default function SpeakingClient() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [transcript, setTranscript] = useState("")
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [loading, setLoading] = useState(false)
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
    }
  }

  function resetForRetry() {
    setTranscript("")
    setEvaluation(null)
    setError("")
  }

  return (
    <>
      <AppHeader title="スピーキング" />

      <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6">
        <div className="mb-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 text-sm font-bold text-slate-500">AI日本語トレーニング</div>
          <h1 className="mb-3 text-[36px] font-black tracking-tight text-slate-900 sm:text-5xl">
            話す練習をしよう
          </h1>
          <p className="text-base leading-8 text-slate-600">
            言いたいことを入れて、日本語候補を2つから選び、録音してAI評価まで進めます。
          </p>
        </div>

        <div className="space-y-5">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <StepBadge step={1} />
              <div>
                <div className="text-sm font-bold text-slate-500">STEP 1</div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  言いたいことを入れる
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  母国語で入力すると、すぐに日本語候補を2つ作ります。
                </p>
              </div>
            </div>

            <SpeakingInput onGenerate={generate} loading={loading} />
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {candidates.length > 0 ? (
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <StepBadge step={2} />
                <div>
                  <div className="text-sm font-bold text-slate-500">STEP 2</div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    日本語候補をえらぶ
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    言いやすい方を1つ選んで、次へ進みます。
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <StepBadge step={3} />
                <div>
                  <div className="text-sm font-bold text-slate-500">STEP 3</div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    話してみよう
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    ボタンを押して話し始め、終わったらもう一度押して停止します。
                  </p>
                </div>
              </div>

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
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <StepBadge step={4} />
                <div>
                  <div className="text-sm font-bold text-slate-500">STEP 4</div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    認識結果とAI評価
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    自分の発話がどう聞こえたかを確認し、次に活かします。
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-bold text-slate-500">認識された日本語</div>
                <div className="text-lg font-bold text-slate-900">{transcript}</div>
              </div>

              {evaluation ? (
                <EvaluationCard result={evaluation} />
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-600">
                  AI評価を作成中です...
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={resetForRetry}
                  className="flex h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white text-base font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  もう一回練習する
                </button>

                <Link
                  href="/"
                  className="flex h-14 items-center justify-center rounded-2xl bg-slate-900 text-base font-bold text-white transition hover:bg-slate-800"
                >
                  TOPに戻る
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-slate-900 text-base font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            TOPに戻る
          </Link>
        </div>
      </div>
    </>
  )
}