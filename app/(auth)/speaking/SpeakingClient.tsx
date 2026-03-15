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
      setError("")

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
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <SpeakingInput onGenerate={generate} />

      {loading && <div>変換中...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {candidates.map((c) => (
        <CandidateCard
          key={c.id}
          candidate={c}
          onSelect={() => setSelected(c)}
        />
      ))}

      {selected && (
        <SpeakingRecorder
          target={selected.japanese}
          onTranscript={(t: string) => {
            setTranscript(t)
            evaluate(t)
          }}
        />
      )}

      {transcript && (
        <div className="border rounded p-3">
          <div className="text-sm text-gray-500">認識結果</div>
          <div>{transcript}</div>
        </div>
      )}

      {evaluation && <EvaluationCard result={evaluation} />}
    </div>
  )
}