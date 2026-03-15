export default function EvaluationCard({result}:{result:any}){

  return(

    <div className="border p-4 space-y-2">

      <div className="text-xl">
        {result.overallResult}
      </div>

      <div>
        意味: {result.scores.meaning}
      </div>

      <div>
        自然さ: {result.scores.naturalness}
      </div>

      <div>
        丁寧さ: {result.scores.politeness}
      </div>

      <div className="text-green-600">
        {result.goodPoints?.join(" / ")}
      </div>

      <div className="text-red-500">
        {result.fixPoints?.join(" / ")}
      </div>

      <div className="font-bold">
        おすすめ: {result.recommended}
      </div>

    </div>
  )
}