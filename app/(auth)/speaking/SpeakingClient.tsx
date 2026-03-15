"use client"

import { useState } from "react"
import SpeakingInput from "./components/SpeakingInput"
import CandidateCard from "./components/CandidateCard"
import SpeakingRecorder from "./components/SpeakingRecorder"
import EvaluationCard from "./components/EvaluationCard"

export default function SpeakingClient() {

  const [candidates, setCandidates] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [transcript, setTranscript] = useState("")
  const [evaluation, setEvaluation] = useState<any>(null)

  async function generate(data:any){

    const res = await fetch("/api/speaking/generate",{
      method:"POST",
      body: JSON.stringify(data)
    })

    const json = await res.json()

    setCandidates(json.candidates)
  }

  async function evaluate(spoken:string){

    const res = await fetch("/api/speaking/evaluate",{
      method:"POST",
      body: JSON.stringify({
        targetText:selected.japanese,
        spokenTranscript:spoken
      })
    })

    const json = await res.json()

    setEvaluation(json)
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">

      <SpeakingInput onGenerate={generate} />

      {candidates.map((c)=>(
        <CandidateCard
          key={c.id}
          candidate={c}
          onSelect={()=>setSelected(c)}
        />
      ))}

      {selected && (
  　　　<SpeakingRecorder
   　　　 target={selected.japanese}
   　　　 onTranscript={(t: string) => {
    　　　  setTranscript(t)
    　　　  evaluate(t)
    }}
  />
      )}

      {evaluation && (
        <EvaluationCard result={evaluation}/>
      )}

    </div>
  )
}