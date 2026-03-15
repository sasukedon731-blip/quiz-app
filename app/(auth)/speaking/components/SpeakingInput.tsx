"use client"

import { useState } from "react"

export default function SpeakingInput({onGenerate}:{onGenerate:any}){

  const [text,setText] = useState("")
  const [language,setLanguage] = useState("en")
  const [scene,setScene] = useState("work")
  const [politeness,setPoliteness] = useState("polite")

  return (

    <div className="space-y-3">

      <select value={language} onChange={(e)=>setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="id">Bahasa Indonesia</option>
        <option value="my">Myanmar</option>
      </select>

      <textarea
        value={text}
        onChange={(e)=>setText(e.target.value)}
        placeholder="What do you want to say?"
      />

      <select value={scene} onChange={(e)=>setScene(e.target.value)}>
        <option value="work">Work</option>
        <option value="daily">Daily</option>
        <option value="interview">Interview</option>
      </select>

      <button
        onClick={()=>onGenerate({
          sourceLanguage:language,
          sourceText:text,
          scene,
          politeness
        })}
      >
        日本語にする
      </button>

    </div>
  )
}