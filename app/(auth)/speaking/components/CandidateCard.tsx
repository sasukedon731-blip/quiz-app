"use client"

type Candidate = {
  id: string
  japanese: string
  reading: string
  note: string
}

type Props = {
  candidate: Candidate
  ranking: number
  selected: boolean
  onSelect: () => void
}

export default function CandidateCard({
  candidate,
  ranking,
  selected,
  onSelect,
}: Props) {
  return (
    <div
      className={[
        "rounded-[28px] border p-5 shadow-sm transition",
        selected
          ? "border-2 border-blue-300 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
          候補 {ranking}
        </div>

        {selected ? (
          <div className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
            選択中
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="rounded-3xl bg-white/80 p-4">
          <div className="text-[30px] font-black leading-tight text-slate-900">
            {candidate.japanese}
          </div>

          {candidate.reading ? (
            <div className="mt-2 text-sm font-semibold text-slate-500">
              {candidate.reading}
            </div>
          ) : null}
        </div>

        {candidate.note ? (
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            {candidate.note}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={[
          "mt-5 flex h-16 w-full items-center justify-center rounded-[22px] px-5 text-lg font-black shadow-sm transition",
          selected
            ? "border-2 border-blue-300 bg-blue-100 text-blue-800"
            : "bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.99]",
        ].join(" ")}
      >
        {selected ? "この文を選択中" : "この文で練習する"}
      </button>
    </div>
  )
}