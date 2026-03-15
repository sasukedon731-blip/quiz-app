"use client"

import { useEffect, useRef, useState } from "react"

type SpeakingRecorderProps = {
  target: string
  reading?: string
  onTranscript: (transcript: string) => void
}

type BrowserSpeechRecognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition
    SpeechRecognition?: new () => BrowserSpeechRecognition
  }
}

export default function SpeakingRecorder({
  target,
  reading,
  onTranscript,
}: SpeakingRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"speech" | "upload" | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      speechRecognitionRef.current?.stop()
    }
  }, [])

  function hasSpeechRecognition() {
    return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  function getMimeType() {
    if (typeof MediaRecorder === "undefined") return ""

    const candidates = [
      "audio/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
    ]

    for (const type of candidates) {
      if (typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return ""
  }

  function startSpeechRecognition() {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      throw new Error("このブラウザは音声認識に対応していません")
    }

    const recognition = new SpeechRecognitionCtor()
    speechRecognitionRef.current = recognition
    recognition.lang = "ja-JP"
    recognition.interimResults = false
    recognition.continuous = false
    setMode("speech")
    setRecording(true)

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result: any) => result?.[0]?.transcript || "")
        .join(" ")
        .trim()

      if (transcript) {
        onTranscript(transcript)
      } else {
        setError("音声を認識できませんでした。もう一度ゆっくり話してください。")
      }
    }

    recognition.onerror = (event) => {
      const code = event?.error || "unknown"
      if (code === "not-allowed") {
        setError("マイクの許可が必要です。Safariの設定でマイクを許可してください。")
      } else if (code === "no-speech") {
        setError("音声が聞き取れませんでした。もう少しはっきり話してください。")
      } else {
        setError("音声認識でエラーが発生しました。もう一度お試しください。")
      }
    }

    recognition.onend = () => {
      setRecording(false)
      speechRecognitionRef.current = null
    }

    recognition.start()
  }

  async function startMediaRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    chunksRef.current = []

    const mimeType = getMimeType()
    const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

    mediaRecorderRef.current = mediaRecorder
    setMode("upload")

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onerror = () => {
      setError("録音中にエラーが発生しました")
      setRecording(false)
    }

    mediaRecorder.onstop = async () => {
      try {
        setRecording(false)
        setProcessing(true)

        const finalMimeType = mediaRecorder.mimeType || mimeType || "audio/webm"
        const blob = new Blob(chunksRef.current, { type: finalMimeType })
        const extension = finalMimeType.includes("mp4")
          ? "m4a"
          : finalMimeType.includes("ogg")
            ? "ogg"
            : "webm"

        if (blob.size === 0) {
          throw new Error("録音データが取得できませんでした")
        }

        const form = new FormData()
        form.append("audio", blob, `speech.${extension}`)

        const res = await fetch("/api/speaking/transcribe", {
          method: "POST",
          body: form,
        })

        const json = await res.json()

        if (!res.ok) {
          throw new Error(json?.error || "音声認識に失敗しました")
        }

        if (!json?.transcript) {
          throw new Error("文字起こし結果が空でした")
        }

        onTranscript(json.transcript)
      } catch (err) {
        console.error("transcribe error:", err)
        setError(err instanceof Error ? err.message : "音声認識に失敗しました")
      } finally {
        setProcessing(false)
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        mediaRecorderRef.current = null
        chunksRef.current = []
      }
    }

    mediaRecorder.start(250)
    setRecording(true)
  }

  async function startRecording() {
    try {
      setError("")

      if (typeof window === "undefined" || typeof navigator === "undefined") {
        throw new Error("この端末では録音を開始できません")
      }

      if (hasSpeechRecognition()) {
        startSpeechRecognition()
        return
      }

      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("このブラウザは録音に対応していません")
      }

      await startMediaRecording()
    } catch (err) {
      console.error("record start error:", err)
      setError(err instanceof Error ? err.message : "録音を開始できませんでした")
      setRecording(false)
    }
  }

  function stopRecording() {
    if (mode === "speech") {
      speechRecognitionRef.current?.stop()
      return
    }

    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === "inactive") return
    recorder.stop()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
        <div className="text-xs font-semibold tracking-wide text-amber-700">お手本</div>
        <div className="mt-1 text-lg font-bold leading-8 text-slate-900">{target}</div>
        {reading ? <div className="mt-2 text-sm text-slate-500">{reading}</div> : null}
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={processing}
          className={[
            "inline-flex min-h-16 w-full items-center justify-center rounded-2xl px-5 py-4 text-base font-bold text-white shadow-sm transition",
            recording ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600",
            processing ? "cursor-not-allowed bg-slate-400 hover:bg-slate-400" : "",
          ].join(" ")}
        >
          {processing ? "認識中..." : recording ? "録音を停止する" : "ここを押して話し始める"}
        </button>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {recording
            ? mode === "speech"
              ? "話し終わったら、もう一度ボタンを押してください。"
              : "話し終わったら「録音を停止する」を押してください。"
            : hasSpeechRecognition()
              ? "iPhoneでは端末の音声認識を優先して使います。"
              : "ボタンを押してから、上の文をゆっくり話してください。"}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
