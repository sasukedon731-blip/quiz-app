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

function labelForResult(value: string) {
  switch (value) {
    case "pass":
      return "とても良い"
    case "almost_ok":
      return "あと少し"
    case "needs_fix":
      return "修正しよう"
    default:
      return value
  }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

export default function EvaluationCard({ result }: { result: EvaluationResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
        <div className="text-sm font-semibold text-emerald-700">総合評価</div>
        <div className="mt-1 text-xl font-bold text-slate-900">{labelForResult(result.overallResult)}</div>
        {result.shortFeedback ? <div className="mt-1 text-sm text-slate-600">{result.shortFeedback}</div> : null}
      </div>

      <div className="grid gap-3">
        <ScoreBar label="意味" value={result.scores.meaning} />
        <ScoreBar label="自然さ" value={result.scores.naturalness} />
        <ScoreBar label="丁寧さ" value={result.scores.politeness} />
      </div>

      {!!result.goodPoints?.length && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="mb-2 text-sm font-bold text-emerald-700">良かったところ</div>
          <ul className="space-y-1 text-sm text-slate-700">
            {result.goodPoints.map((item, index) => (
              <li key={`${item}-${index}`}>・{item}</li>
            ))}
          </ul>
        </div>
      )}

      {!!result.fixPoints?.length && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 text-sm font-bold text-amber-700">直すともっと良いところ</div>
          <ul className="space-y-1 text-sm text-slate-700">
            {result.fixPoints.map((item, index) => (
              <li key={`${item}-${index}`}>・{item}</li>
            ))}
          </ul>
        </div>
      )}

      {result.recommended ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-1 text-sm font-bold text-slate-700">おすすめ表現</div>
          <div className="text-base font-medium text-slate-900">{result.recommended}</div>
        </div>
      ) : null}
    </div>
  )
}
