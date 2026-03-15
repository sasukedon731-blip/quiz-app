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

type EvaluationCardProps = {
  result: EvaluationResult
}

function labelByResult(result: string) {
  if (result === "pass") return { text: "かなり良い", chip: "bg-emerald-50 text-emerald-700", panel: "border-emerald-200 bg-emerald-50/40" }
  if (result === "almost_ok") return { text: "あと少し", chip: "bg-amber-50 text-amber-700", panel: "border-amber-200 bg-amber-50/40" }
  return { text: "要改善", chip: "bg-rose-50 text-rose-700", panel: "border-rose-200 bg-rose-50/40" }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-slate-900 transition-all"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}

export default function EvaluationCard({ result }: EvaluationCardProps) {
  const tone = labelByResult(result.overallResult)

  return (
    <section className={`rounded-3xl border p-5 shadow-sm md:p-6 ${tone.panel}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            STEP 4
          </div>
          <h3 className="text-xl font-bold text-slate-900">AI評価</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">意味・自然さ・丁寧さの3つでチェックしました。</p>
        </div>
        <div className={`rounded-full px-4 py-2 text-sm font-bold ${tone.chip}`}>{tone.text}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ScoreBar label="意味" value={result.scores.meaning} />
        <ScoreBar label="自然さ" value={result.scores.naturalness} />
        <ScoreBar label="丁寧さ" value={result.scores.politeness} />
      </div>

      {result.shortFeedback ? (
        <div className="mt-5 rounded-2xl bg-white/80 p-4 text-sm leading-6 text-slate-700">{result.shortFeedback}</div>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/80 bg-white/80 p-4">
          <div className="mb-3 text-sm font-bold text-slate-900">よかった点</div>
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {(result.goodPoints?.length ? result.goodPoints : ["意味はおおむね伝わっています。"]).map((item) => (
              <li key={item}>・{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white/80 p-4">
          <div className="mb-3 text-sm font-bold text-slate-900">次に直すとよい点</div>
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {(result.fixPoints?.length ? result.fixPoints : ["文末や助詞をゆっくり発音するとさらに良くなります。"]).map((item) => (
              <li key={item}>・{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {result.recommended ? (
        <div className="mt-5 rounded-3xl border border-white/80 bg-white/90 p-4">
          <div className="text-xs font-semibold text-slate-500">おすすめの言い方</div>
          <div className="mt-2 text-base font-bold leading-7 text-slate-900">{result.recommended}</div>
        </div>
      ) : null}
    </section>
  )
}
