type Candidate = {
  id: string
  japanese: string
  reading: string
  note: string
}

type CandidateCardProps = {
  candidate: Candidate
  selected?: boolean
  recommended?: boolean
  onSelect: () => void
  onPlay?: () => void
  playing?: boolean
}

export default function CandidateCard({
  candidate,
  selected = false,
  recommended = false,
  onSelect,
  onPlay,
  playing = false,
}: CandidateCardProps) {
  return (
    <div
      className={[
        "rounded-3xl border p-4 shadow-sm transition",
        selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300",
      ].join(" ")}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold",
              selected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700",
            ].join(" ")}
          >
            候補
          </span>
          {recommended ? (
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-bold",
                selected ? "bg-emerald-400/20 text-emerald-100" : "bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              おすすめ
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onPlay}
          className={[
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            selected
              ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          ].join(" ")}
        >
          {playing ? "再生中..." : "音声を聞く"}
        </button>
      </div>

      <div className="text-lg font-bold leading-8">{candidate.japanese}</div>
      <div className={selected ? "mt-2 text-sm text-slate-200" : "mt-2 text-sm text-slate-500"}>
        {candidate.reading}
      </div>
      <div className={selected ? "mt-3 text-sm text-slate-100" : "mt-3 text-sm text-slate-600"}>
        {candidate.note}
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={[
          "mt-4 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold transition",
          selected
            ? "bg-white text-slate-900 hover:bg-slate-100"
            : "bg-slate-900 text-white hover:opacity-90",
        ].join(" ")}
      >
        {selected ? "この文を選択中" : "この文で練習する"}
      </button>
    </div>
  )
}
