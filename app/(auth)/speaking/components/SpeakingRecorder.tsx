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
  const recognitionRef = useRef<any>(null)

  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [localError, setLocalError] = useState("")
  const [status, setStatus] = useState("まだ録音していません。")
  const [liveTranscript, setLiveTranscript] = useState("")

  useEffect(() => {
    return () => {
      stopTracks()
      stopRecognition()
    }
  }, [])

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  function stopRecognition() {
    try {
      recognitionRef.current?.stop?.()
    } catch {}
    recognitionRef.current = null
  }

  function emitError(message: string) {
    setLocalError(message)
    onError?.(message)
  }

  function mapPermissionError(error: any) {
    if (error?.name === "NotAllowedError") {
      return "マイクが許可されていません。iPhoneの「設定 → Chrome → マイク」をONにして、ページを再読み込みしてください。"
    }
    if (error?.name === "NotFoundError") {
      return "マイクが見つかりませんでした。端末のマイク設定を確認してください。"
    }
    if (error?.name === "NotReadableError") {
      return "マイクを使用できませんでした。他のアプリがマイクを使っていないか確認してください。"
    }
    return error instanceof Error ? error.message : "録音を開始できませんでした。"
  }

  function supportsSpeechRecognition() {
    if (typeof window === "undefined") return false
    const w = window as any
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
  }

  async function startBrowserRecognition() {
    const w = window as any
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = "ja-JP"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const spoken = String(event?.results?.[0]?.[0]?.transcript ?? "").trim()
      if (spoken) {
        setLiveTranscript(spoken)
        onTranscript(spoken)
      }
    }

    recognition.onerror = (event: any) => {
      const code = String(event?.error || "")
      if (code === "not-allowed") {
        emitError("マイクが許可されていません。iPhoneの「設定 → Chrome → マイク」をONにして、ページを再読み込みしてください。")
      } else {
        emitError("音声認識に失敗しました。もう一度お試しください。")
      }
      setRecording(false)
      setStatus("音声認識に失敗しました。")
      stopRecognition()
    }

    recognition.onend = () => {
      setRecording(false)
      setProcessing(false)
      setStatus("音声認識が完了しました。")
      stopRecognition()
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  async function startMediaRecorder() {
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
      setProcessing(false)
      setStatus("録音に失敗しました。")
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
          throw new Error("音声が取得できませんでした。マイク権限を確認して、もう一度お試しください。")
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

        setLiveTranscript(spoken)
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
  }

  async function startRecording() {
    try {
      setLocalError("")
      onError?.("")
      setLiveTranscript("")

      if (supportsSpeechRecognition()) {
        setRecording(true)
        setProcessing(true)
        setStatus("音声認識中です。話してください。")
        await startBrowserRecognition()
        return
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("この端末ではマイク録音に対応していません。")
      }

      await startMediaRecorder()
      setRecording(true)
      setProcessing(false)
      setStatus("録音中です。話し終わったらもう一度ボタンを押してください。")
    } catch (error: any) {
      emitError(mapPermissionError(error))
      setRecording(false)
      setProcessing(false)
      setStatus("録音を開始できませんでした。")
      stopTracks()
      stopRecognition()
    }
  }

  function stopRecording() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        setStatus("音声認識を終了しています...")
      } catch {
        setStatus("音声認識を終了できませんでした。")
      }
      return
    }

    const recorder = mediaRecorderRef.current
    if (!recorder) return

    if (recorder.state !== "inactive") {
      recorder.stop()
      setStatus("録音を終了しています...")
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 text-xs font-black tracking-wide text-slate-500">お手本</div>
        <div className="text-[30px] font-black leading-tight text-slate-900">{target}</div>
        {reading ? (
          <div className="mt-2 text-sm font-semibold text-slate-500">{reading}</div>
        ) : null}
        {note ? (
          <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600">
            {note}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        disabled={processing && !recording}
        onClick={recording ? stopRecording : startRecording}
        className={[
          "flex h-16 w-full items-center justify-center rounded-[24px] px-5 text-lg font-black text-white shadow-sm transition",
          processing && !recording
            ? "bg-slate-400"
            : recording
              ? "bg-red-600 hover:bg-red-500"
              : "bg-emerald-600 hover:bg-emerald-500",
        ].join(" ")}
      >
        {processing && !recording
          ? "文字起こし中..."
          : recording
            ? "録音を停止する"
            : "ここを押して話し始める"}
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold leading-6 text-slate-700">
        {status}
      </div>

      {liveTranscript ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
          <div className="mb-1 text-xs font-black text-blue-700">認識結果</div>
          <div className="text-lg font-black text-slate-900">{liveTranscript}</div>
        </div>
      ) : null}

      {localError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold leading-6 text-red-700">
          {localError}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          マイクが動かないときは、iPhoneの
          <span className="font-bold text-slate-900">「設定 → Chrome → マイク」</span>
          を確認してください。
        </div>
      )}
    </div>
  )
}