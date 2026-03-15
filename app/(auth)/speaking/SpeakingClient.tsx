"use client"

import { useMemo, useState } from "react"
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

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6 space-y-2">
        <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          AI日本語スピーキング
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">話す練習をしよう</h1>
        <p className="text-sm leading-6 text-slate-600 sm:text-base">
          まず言いたいことを入れて、日本語候補を2つから選びます。選んだら録音して、AI評価まで一気に進めます。
        </p>
      </div>

      <div className="space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              1
            </div>
            <div>
              <h2 className="font-bold text-slate-900">言いたいことを入れる</h2>
              <p className="text-xs text-slate-500">母国語で入力して日本語候補を作ります</p>
            </div>
          </div>
          <SpeakingInput onGenerate={generate} loading={loading} />
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {candidates.length > 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                2
              </div>
              <div>
                <h2 className="font-bold text-slate-900">日本語候補をえらぶ</h2>
                <p className="text-xs text-slate-500">おすすめ2つだけ表示します。言いやすい方を選んでください。</p>
              </div>
            </div>

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
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                3
              </div>
              <div>
                <h2 className="font-bold text-slate-900">話してみよう</h2>
                <p className="text-xs text-slate-500">ボタンを1回押して話し始めて、話し終わったらもう1回押して停止します。</p>
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
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                4
              </div>
              <div>
                <h2 className="font-bold text-slate-900">認識結果と評価</h2>
                <p className="text-xs text-slate-500">自分の発話がどう聞こえたか確認できます</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-1 text-xs font-semibold text-slate-500">認識された日本語</div>
              <div className="text-base font-medium text-slate-900">{transcript}</div>
            </div>

            {evaluation ? <div className="mt-4"><EvaluationCard result={evaluation} /></div> : <div className="mt-4 text-sm text-slate-500">AIが評価中です...</div>}
          </section>
        ) : null}
      </div>
    </div>
  )
}
