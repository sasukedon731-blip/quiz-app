"use client"

import { useState } from "react"
import Link from "next/link"

import AppHeader from "@/app/components/AppHeader"
import SpeakingInput from "./components/SpeakingInput"
import CandidateCard from "./components/CandidateCard"
import SpeakingRecorder from "./components/SpeakingRecorder"
import EvaluationCard from "./components/EvaluationCard"

type Candidate = {
  id: string
  japanese: string
  reading?: string
  note?: string
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
      setCandidates([])
      setSelected(null)
      setTranscript("")
      setEvaluation(null)

      const res = await fetch("/api/speaking/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || "日本語候補の作成に失敗しました")
      }

      const nextCandidates = Array.isArray(json?.candidates) ? json.candidates : []
      setCandidates(nextCandidates)
      if (nextCandidates.length > 0) {
        setSelected(nextCandidates[0])
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "エラーが発生しました")
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
        headers: { "Content-Type": "application/json" },
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
      console.error(err)
      setError(err instanceof Error ? err.message : "評価に失敗しました")
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

      <main style={styles.main}>
        <section style={styles.heroCard}>
          <div style={styles.eyebrow}>AI日本語トレーニング</div>
          <h1 style={styles.heroTitle}>話す練習をしよう</h1>
          <p style={styles.heroText}>
            言いたいことを入れて、日本語候補を2つから選び、録音してAI評価まで進めます。
          </p>
        </section>

        <section style={styles.sectionCard}>
          <div style={styles.stepRow}>
            <div style={styles.stepBadge}>1</div>
            <div>
              <div style={styles.stepLabel}>STEP 1</div>
              <h2 style={styles.sectionTitle}>言いたいことを入れる</h2>
              <p style={styles.sectionText}>
                母国語で入力すると、日本語候補を2つ作ります。
              </p>
            </div>
          </div>

          <SpeakingInput onGenerate={generate} loading={loading} />
        </section>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

        {candidates.length > 0 ? (
          <section style={styles.sectionCard}>
            <div style={styles.stepRow}>
              <div style={styles.stepBadge}>2</div>
              <div>
                <div style={styles.stepLabel}>STEP 2</div>
                <h2 style={styles.sectionTitle}>日本語候補をえらぶ</h2>
                <p style={styles.sectionText}>
                  言いやすい方を1つ選んで、次へ進みます。
                </p>
              </div>
            </div>

            <div style={styles.stack}>
              {candidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  ranking={index + 1}
                  selected={selected?.id === candidate.id}
                  onSelect={() => {
                    setSelected(candidate)
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
          <section style={styles.sectionCard}>
            <div style={styles.stepRow}>
              <div style={styles.stepBadge}>3</div>
              <div>
                <div style={styles.stepLabel}>STEP 3</div>
                <h2 style={styles.sectionTitle}>話してみよう</h2>
                <p style={styles.sectionText}>
                  ボタンを押して話し始め、終わったらもう一度押して停止します。
                </p>
              </div>
            </div>

            <SpeakingRecorder
              key={selected.id}
              target={selected.japanese}
              reading={selected.reading}
              note={selected.note}
              onTranscript={(value) => {
                setTranscript(value)
                void evaluate(value)
              }}
              onError={(message) => setError(message)}
            />
          </section>
        ) : null}

        {transcript ? (
          <section style={styles.sectionCard}>
            <div style={styles.stepRow}>
              <div style={styles.stepBadge}>4</div>
              <div>
                <div style={styles.stepLabel}>STEP 4</div>
                <h2 style={styles.sectionTitle}>認識結果とAI評価</h2>
                <p style={styles.sectionText}>
                  自分の発話がどう聞こえたかを確認します。
                </p>
              </div>
            </div>

            <div style={styles.transcriptCard}>
              <div style={styles.transcriptLabel}>認識された日本語</div>
              <div style={styles.transcriptText}>{transcript}</div>
            </div>

            {evaluation ? (
              <EvaluationCard result={evaluation} />
            ) : (
              <div style={styles.infoBox}>AI評価を作成中です...</div>
            )}

            <div style={styles.actionRow}>
              <button type="button" onClick={resetForRetry} style={styles.subButton}>
                もう一回練習する
              </button>

              <Link href="/" style={styles.darkButton}>
                TOPに戻る
              </Link>
            </div>
          </section>
        ) : null}
      </main>

      <div style={styles.bottomBar}>
        <div style={styles.bottomBarInner}>
          <Link href="/" style={styles.bottomBarButton}>
            TOPに戻る
          </Link>
        </div>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 880,
    margin: "0 auto",
    padding: "16px 16px 168px",
  },
  heroCard: {
    background: "#ffffff",
    border: "1px solid #d9e0ea",
    borderRadius: 28,
    padding: 20,
    boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: 800,
    color: "#64748b",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 1.15,
    fontWeight: 900,
    color: "#0f172a",
    margin: "0 0 12px",
  },
  heroText: {
    fontSize: 16,
    lineHeight: 1.8,
    color: "#475569",
    margin: 0,
  },
  sectionCard: {
    background: "#ffffff",
    border: "1px solid #d9e0ea",
    borderRadius: 28,
    padding: 20,
    boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
    marginBottom: 16,
  },
  stepRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  stepBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: 999,
    background: "#0f172a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 900,
    flexShrink: 0,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: 800,
    color: "#64748b",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 900,
    color: "#0f172a",
    margin: 0,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#64748b",
    margin: "8px 0 0",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    borderRadius: 18,
    padding: "14px 16px",
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 16,
  },
  stack: {
    display: "grid",
    gap: 14,
  },
  transcriptCard: {
    background: "#f8fafc",
    border: "1px solid #d9e0ea",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: "#64748b",
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.5,
  },
  infoBox: {
    background: "#f8fafc",
    border: "1px solid #d9e0ea",
    color: "#475569",
    borderRadius: 18,
    padding: "16px 18px",
    fontSize: 14,
    fontWeight: 700,
  },
  actionRow: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "1fr",
    marginTop: 16,
  },
  subButton: {
    height: 56,
    borderRadius: 18,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  },
  darkButton: {
    height: 56,
    borderRadius: 18,
    background: "#0f172a",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 800,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    borderTop: "1px solid #d9e0ea",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(8px)",
    padding: "12px 16px calc(env(safe-area-inset-bottom) + 12px)",
  },
  bottomBarInner: {
    maxWidth: 880,
    margin: "0 auto",
  },
  bottomBarButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 56,
    borderRadius: 18,
    background: "#0f172a",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 900,
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(15,23,42,0.14)",
  },
}