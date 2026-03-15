type Candidate = {
  japanese: string
  reading: string
  note: string
}

type CandidateCardProps = {
  candidate: Candidate
  selected?: boolean
  onSelect: () => void
}

export default function CandidateCard({ candidate, selected = false, onSelect }: CandidateCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border p-4 transition",
        selected
          ? "border-violet-500 bg-violet-50 ring-4 ring-violet-100"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="space-y-2">
        <div className="text-lg font-bold leading-8 text-slate-900">{candidate.japanese}</div>
        <div className="text-sm text-slate-500">{candidate.reading}</div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{candidate.note}</div>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={[
          "mt-4 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold transition",
          selected
            ? "bg-violet-600 text-white hover:bg-violet-700"
            : "bg-slate-900 text-white hover:bg-slate-700",
        ].join(" ")}
      >
        {selected ? "この文を選択中" : "この文で練習する"}
      </button>
    </div>
  )
}
