type Candidate = {
  japanese: string
  reading: string
  note: string
}

type CandidateCardProps = {
  candidate: Candidate
  rank?: number
  selected?: boolean
  onSelect: () => void
}

export default function CandidateCard({
  candidate,
  rank,
  selected = false,
  onSelect,
}: CandidateCardProps) {
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
        <div className="flex items-center gap-2">
          {rank ? (
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-bold text-white">
              {rank}
            </span>
          ) : null}
          <span className="text-xs font-semibold tracking-wide text-slate-500">
            {selected ? "選択中の候補" : "候補文"}
          </span>
        </div>
        <div className="text-xl font-bold leading-9 text-slate-900">{candidate.japanese}</div>
        <div className="text-sm text-slate-500">{candidate.reading}</div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{candidate.note}</div>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={[
          "mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-2xl px-4 py-4 text-base font-bold transition",
          selected
            ? "bg-violet-600 text-white hover:bg-violet-700"
            : "bg-slate-900 text-white hover:bg-slate-700",
        ].join(" ")}
      >
        {selected ? "この文を選択中" : "この文をえらんで次へ進む"}
      </button>
    </div>
  )
}
