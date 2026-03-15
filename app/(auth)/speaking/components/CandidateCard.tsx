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
        selected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
          {ranking === 1 ? "おすすめ" : "候補"} {ranking}
        </div>
        {selected ? <div className="text-xs font-bold text-indigo-700">選択中</div> : null}
      </div>

      <div className="space-y-2">
        <div className="text-xl font-bold leading-8 text-slate-900">{candidate.japanese}</div>
        <div className="text-sm text-slate-500">{candidate.reading}</div>
        <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600">{candidate.note}</div>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={[
          "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold transition",
          selected ? "bg-indigo-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800",
        ].join(" ")}
      >
        {selected ? "この文を選択中" : "この文をえらんで次へ進む"}
      </button>
    </div>
  )
}
