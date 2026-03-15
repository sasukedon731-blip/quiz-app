type Scores = {
  meaning: number
  naturalness: number
  politeness: number
}

type Result = {
  overallResult: string
  scores: Scores
  goodPoints?: string[]
  fixPoints?: string[]
  recommended?: string
  shortFeedback?: string
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)))
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{safeValue}<span className="ml-1 text-sm font-semibold text-slate-500">点</span></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}

export default function EvaluationCard({ result }: { result: Result }) {
  const summaryLabel =
    result.overallResult === "pass"
      ? "かなり良いです"
      : result.overallResult === "almost_ok"
        ? "あと少しで自然です"
        : "言い直すともっと良くなります"

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-slate-900 p-5 text-white">
        <div className="text-xs font-semibold text-white/70">総合評価</div>
        <div className="mt-1 text-2xl font-bold">{summaryLabel}</div>
        {result.shortFeedback ? <div className="mt-2 text-sm leading-6 text-white/85">{result.shortFeedback}</div> : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ScoreBox label="意味" value={result.scores?.meaning ?? 0} />
        <ScoreBox label="自然さ" value={result.scores?.naturalness ?? 0} />
        <ScoreBox label="丁寧さ" value={result.scores?.politeness ?? 0} />
      </div>

      {result.goodPoints?.length ? (
        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="mb-2 text-sm font-bold text-emerald-800">良かったところ</div>
          <ul className="space-y-1 text-sm leading-6 text-emerald-700">
            {result.goodPoints.map((item, idx) => (
              <li key={`${item}-${idx}`}>・{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.fixPoints?.length ? (
        <div className="rounded-2xl bg-amber-50 p-4">
          <div className="mb-2 text-sm font-bold text-amber-900">直すともっと良いところ</div>
          <ul className="space-y-1 text-sm leading-6 text-amber-800">
            {result.fixPoints.map((item, idx) => (
              <li key={`${item}-${idx}`}>・{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.recommended ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-1 text-sm font-bold text-slate-700">おすすめ表現</div>
          <div className="text-lg font-semibold text-slate-900">{result.recommended}</div>
        </div>
      ) : null}
    </div>
  )
}
