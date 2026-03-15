"use client"

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

function ScorePill({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div className="text-sm font-bold text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-black text-slate-900">{value}</div>
      <div className="text-xs font-semibold text-slate-500">/ 5</div>
    </div>
  )
}

export default function EvaluationCard({
  result,
}: {
  result: EvaluationResult
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5">
        <div className="mb-2 text-sm font-black text-emerald-700">総合評価</div>
        <div className="text-3xl font-black text-slate-900">{result.overallResult}</div>
        {result.shortFeedback ? (
          <div className="mt-3 text-base leading-7 text-slate-700">{result.shortFeedback}</div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ScorePill label="意味" value={result.scores.meaning} />
        <ScorePill label="自然さ" value={result.scores.naturalness} />
        <ScorePill label="丁寧さ" value={result.scores.politeness} />
      </div>

      {result.goodPoints?.length ? (
        <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-5">
          <div className="mb-3 text-lg font-black text-slate-900">良かったところ</div>
          <ul className="space-y-2 text-sm font-semibold leading-6 text-slate-700">
            {result.goodPoints.map((item, idx) => (
              <li key={`${item}-${idx}`}>・{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.fixPoints?.length ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
          <div className="mb-3 text-lg font-black text-slate-900">直すともっと良いところ</div>
          <ul className="space-y-2 text-sm font-semibold leading-6 text-slate-700">
            {result.fixPoints.map((item, idx) => (
              <li key={`${item}-${idx}`}>・{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.recommended ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <div className="mb-2 text-sm font-black text-slate-500">おすすめ表現</div>
          <div className="text-xl font-black leading-8 text-slate-900">
            {result.recommended}
          </div>
        </div>
      ) : null}
    </div>
  )
}