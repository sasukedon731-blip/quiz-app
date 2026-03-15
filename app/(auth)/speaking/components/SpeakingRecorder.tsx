"use client"

import { useState } from "react"

type SpeakingRecorderProps = {
  target: string
  onTranscript: (transcript: string) => void
}

export default function SpeakingRecorder({
  target,
  onTranscript,
}: SpeakingRecorderProps) {
  const [recording, setRecording] = useState(false)

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data)

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" })

      const form = new FormData()
      form.append("audio", blob)

      const res = await fetch("/api/speaking/transcribe", {
        method: "POST",
        body: form,
      })

      const json = await res.json()
      onTranscript(json.transcript)
    }

    mediaRecorder.start()
    setRecording(true)

    setTimeout(() => {
      mediaRecorder.stop()
      setRecording(false)
    }, 4000)
  }

  return (
    <div>
      <div className="font-bold">{target}</div>

      <button onClick={start}>
        {recording ? "録音中..." : "話す"}
      </button>
    </div>
  )
}