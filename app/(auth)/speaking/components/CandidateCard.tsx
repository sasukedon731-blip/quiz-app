type Candidate = {
  id: string
  japanese: string
  reading: string
  note: string
}

type Props = {
  candidate: Candidate
  onSelect: () => void
  selected?: boolean
  ranking?: number
}

export default function CandidateCard({ candidate, onSelect, selected = false, ranking = 1 }: Props) {
  return (
    <div
      className={[
        "rounded-3xl border p-4 transition",
        selected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {ranking === 1 ? "おすすめ" : "候補"} {ranking}
        </div>
        {selected ? <div className="text-xs font-bold text-emerald-700">選択中</div> : null}
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold leading-9 text-slate-900">{candidate.japanese}</div>
        {candidate.reading ? <div className="text-sm text-slate-500">{candidate.reading}</div> : null}
        {candidate.note ? (
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">{candidate.note}</div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={[
          "mt-4 flex h-14 w-full items-center justify-center rounded-2xl px-4 text-base font-bold transition",
          selected ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800",
        ].join(" ")}
      >
        {selected ? "この文を選択中" : "この文をえらんで次へ進む"}
      </button>
    </div>
  )
}
