export default function CandidateCard({candidate,onSelect}:{candidate:any,onSelect:any}){

  return(

    <div className="border p-3 rounded">

      <div className="text-lg font-bold">
        {candidate.japanese}
      </div>

      <div className="text-gray-500">
        {candidate.reading}
      </div>

      <div className="text-sm">
        {candidate.note}
      </div>

      <button onClick={onSelect}>
        この文で練習
      </button>

    </div>
  )
}