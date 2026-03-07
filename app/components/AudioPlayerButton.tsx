"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
  src: string
  title?: string
  className?: string
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

export default function AudioPlayerButton({
  src,
  title = "音声を聞いて答えてください",
  className = "",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const progress = useMemo(() => {
    if (!duration || !Number.isFinite(duration)) return 0
    return Math.min(100, Math.max(0, (currentTime / duration) * 100))
  }, [currentTime, duration])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => {
      setIsReady(true)
      setDuration(audio.duration || 0)
    }

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(audio.duration || 0)
    }

    const onPause = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)

    audio.addEventListener("loadedmetadata", onLoaded)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("play", onPlay)

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("play", onPlay)
    }
  }, [src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setIsReady(false)
  }, [src])

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch (e) {
      console.error("audio play error", e)
    }
  }

  function replay() {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch((e) => {
      console.error("audio replay error", e)
    })
  }

  return (
    <div
      className={`mb-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 shadow-sm ${className}`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg transition hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "音声を停止" : "音声を再生"}
        >
          {isPlaying ? (
            <span className="absolute inset-0 rounded-full animate-ping bg-sky-300/40" />
          ) : null}

          <span className="relative text-2xl leading-none">
            {isPlaying ? "⏸" : "▶"}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-bold text-slate-900">{title}</div>
              <div className="mt-1 text-sm text-slate-500">
                {isPlaying ? "再生中..." : isReady ? "タップで再生" : "読み込み中..."}
              </div>
            </div>

            <div className="shrink-0 text-sm font-semibold text-slate-600">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={replay}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
            >
              もう一回
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}