"use client"

import { useEffect, useRef, useState } from "react"

type SpeakingRecorderProps = {
  target: string
  onTranscript: (transcript: string) => void
}

export default function SpeakingRecorder({ target, onTranscript }: SpeakingRecorderProps) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const autoStopRef = useRef<number | null>(null)

  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const clearTimer = () => {
    if (autoStopRef.current) {
      window.clearTimeout(autoStopRef.current)
      autoStopRef.current = null
    }
  }

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  useEffect(() => {
    return () => {
      clearTimer()
      cleanupStream()
    }
  }, [])

  const stopRecording = async () => {
    if (!recorderRef.current || recorderRef.current.state === "inactive") return
    clearTimer()
    recorderRef.current.stop()
    setRecording(false)
  }

  const startRecording = async () => {
    try {
      setError("")
      setBusy(false)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      streamRef.current = stream
      recorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        try {
          setBusy(true)
          const blob = new Blob(chunksRef.current, { type: "audio/webm" })
          const form = new FormData()
          form.append("audio", blob, "speech.webm")

          const res = await fetch("/api/speaking/transcribe", {
            method: "POST",
            body: form,
          })
          const json = await res.json()
          if (!res.ok) throw new Error(json?.error || "文字起こしに失敗しました")
          onTranscript(String(json?.transcript ?? ""))
        } catch (err) {
          setError(err instanceof Error ? err.message : "音声認識に失敗しました")
        } finally {
          cleanupStream()
          recorderRef.current = null
          chunksRef.current = []
          setBusy(false)
        }
      }

      mediaRecorder.start()
      setRecording(true)
      autoStopRef.current = window.setTimeout(() => {
        stopRecording().catch(() => undefined)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "マイクの使用を開始できませんでした")
      cleanupStream()
      setRecording(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            STEP 3
          </div>
          <h3 className="text-xl font-bold text-slate-900">話してみよう</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">下の文を見ながら、5秒以内で話してください。</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">録音は自動停止します</div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold text-slate-500">お手本</div>
        <div className="mt-2 text-lg font-bold leading-8 text-slate-900">{target}</div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "文字起こし中..." : "録音スタート"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              stopRecording().catch(() => undefined)
            }}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            録音を停止する
          </button>
        )}
      </div>

      <div className="mt-3 text-xs leading-5 text-slate-500">
        コツ: 大きな声で、文末までゆっくりはっきり話すと認識されやすくなります。
      </div>

      {error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
    </section>
  )
}
