"use client"

import { useEffect, useRef, useState } from "react"

type SpeakingRecorderProps = {
  target: string
  reading?: string
  note?: string
  onTranscript: (transcript: string) => void
  onError?: (message: string) => void
}

export default function SpeakingRecorder({
  target,
  reading,
  note,
  onTranscript,
  onError,
}: SpeakingRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [localError, setLocalError] = useState("")
  const [status, setStatus] = useState("まだ録音していません。")

  useEffect(() => {
    return () => {
      stopTracks()
    }
  }, [])

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  function emitError(message: string) {
    setLocalError(message)
    onError?.(message)
  }

  async function startRecording() {
    try {
      setLocalError("")
      onError?.("")

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("この端末ではマイク録音に対応していません。")
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/webm",
      ].find((type) => {
        try {
          return typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)
        } catch {
          return false
        }
      })

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onerror = () => {
        emitError("録音中にエラーが発生しました。もう一度お試しください。")
        setRecording(false)
        stopTracks()
      }

      recorder.onstop = async () => {
        try {
          setRecording(false)
          setProcessing(true)
          setStatus("文字起こし中です...")

          const blob = new Blob(chunksRef.current, {
            type: mimeType || "audio/webm",
          })

          if (blob.size === 0) {
            throw new Error("音声が取得できませんでした。Safariのマイク許可を確認してください。")
          }

          const fileName = blob.type.includes("mp4") ? "speech.m4a" : "speech.webm"
          const file = new File([blob], fileName, { type: blob.type || "audio/webm" })

          const form = new FormData()
          form.append("audio", file)

          const res = await fetch("/api/speaking/transcribe", {
            method: "POST",
            body: form,
          })

          const json = await res.json()

          if (!res.ok) {
            throw new Error(json?.error || "文字起こしに失敗しました")
          }

          const spoken = String(json?.transcript ?? "").trim()
          if (!spoken) {
            throw new Error("文字起こし結果が空でした。もう一度はっきり話してください。")
          }

          setStatus("文字起こしが完了しました。")
          onTranscript(spoken)
        } catch (error) {
          emitError(error instanceof Error ? error.message : "録音処理に失敗しました")
          setStatus("録音に失敗しました。")
        } finally {
          setProcessing(false)
          stopTracks()
          mediaRecorderRef.current = null
        }
      }

      recorder.start()
      setRecording(true)
      setStatus("録音中です。話し終わったらもう一度ボタンを押してください。")
    } catch (error) {
      emitError(error instanceof Error ? error.message : "マイクを開始できませんでした")
      setRecording(false)
      stopTracks()
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    if (recorder.state !== "inactive") {
      recorder.stop()
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-slate-50 p-4">
        <div className="mb-2 text-xs font-semibold text-slate-500">お手本</div>
        <div className="text-2xl font-bold leading-9 text-slate-900">{target}</div>
        {reading ? <div className="mt-2 text-sm text-slate-500">{reading}</div> : null}
        {note ? <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-slate-600">{note}</div> : null}
      </div>

      <button
        type="button"
        disabled={processing}
        onClick={recording ? stopRecording : startRecording}
        className={[
          "w-full rounded-2xl px-4 py-4 text-base font-bold text-white transition",
          processing
            ? "bg-slate-400"
            : recording
              ? "bg-red-600 hover:bg-red-500"
              : "bg-indigo-600 hover:bg-indigo-500",
        ].join(" ")}
      >
        {processing ? "文字起こし中..." : recording ? "録音を停止する" : "ここを押して話し始める"}
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        {status}
      </div>

      {localError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </div>
      ) : (
        <div className="text-xs leading-5 text-slate-500">
          iPhoneでは、最初にマイク許可が必要です。録音開始後に話し、話し終わったらもう一度同じボタンを押してください。
        </div>
      )}
    </div>
  )
}
