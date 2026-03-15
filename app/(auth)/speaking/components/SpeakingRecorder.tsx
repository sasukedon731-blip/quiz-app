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
      setProcessing(false)
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
    <div style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          border: "1px solid #d9e0ea",
          background: "#f8fafc",
          borderRadius: 24,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: "#64748b",
            marginBottom: 8,
            letterSpacing: 0.4,
          }}
        >
          お手本
        </div>

        <div
          style={{
            fontSize: 30,
            lineHeight: 1.3,
            fontWeight: 900,
            color: "#0f172a",
            wordBreak: "break-word",
          }}
        >
          {target}
        </div>

        {reading ? (
          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              fontWeight: 700,
              color: "#64748b",
            }}
          >
            {reading}
          </div>
        ) : null}

        {note ? (
          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              background: "#ffffff",
              padding: "12px 14px",
              fontSize: 14,
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            {note}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        disabled={processing && !recording}
        onClick={recording ? stopRecording : startRecording}
        style={{
          width: "100%",
          height: 68,
          borderRadius: 22,
          border: "none",
          background:
            processing && !recording
              ? "#94a3b8"
              : recording
                ? "#dc2626"
                : "#16a34a",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: "0 8px 18px rgba(15,23,42,0.12)",
        }}
      >
        {processing && !recording
          ? "文字起こし中..."
          : recording
            ? "録音を停止する"
            : "ここを押して話し始める"}
      </button>

      <div
        style={{
          border: "1px solid #d9e0ea",
          background: "#ffffff",
          borderRadius: 18,
          padding: "14px 16px",
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.7,
          color: "#334155",
        }}
      >
        {status}
      </div>

      {liveTranscript ? (
        <div
          style={{
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            borderRadius: 18,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#1d4ed8",
              marginBottom: 6,
            }}
          >
            認識結果
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.5,
            }}
          >
            {liveTranscript}
          </div>
        </div>
      ) : null}

      {localError ? (
        <div
          style={{
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: 18,
            padding: "14px 16px",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.7,
          }}
        >
          {localError}
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #d9e0ea",
            background: "#f8fafc",
            borderRadius: 18,
            padding: "14px 16px",
            fontSize: 14,
            lineHeight: 1.7,
            color: "#475569",
          }}
        >
          マイクが動かないときは、iPhoneの
          <span style={{ fontWeight: 900, color: "#0f172a" }}>
            {" "}「設定 → Chrome → マイク」
          </span>
          を確認してください。
        </div>
      )}
    </div>
  )
}