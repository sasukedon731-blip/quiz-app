'use client'

import { useEffect, useMemo, useState } from 'react'
import Button from '@/app/components/Button'
import { canSpeak, speak, stopSpeak } from '@/app/lib/tts'

type Props = {
  text?: string
  storageKeyPrefix?: string
}

export default function ListeningControls({ text, storageKeyPrefix = 'listening' }: Props) {
  const supported = useMemo(() => canSpeak(), [])

  const keyAuto = `${storageKeyPrefix}-tts-auto`
  const keyRate = `${storageKeyPrefix}-tts-rate`

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [autoPlay, setAutoPlay] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(keyAuto) === '1'
  })
  const [rate, setRate] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.0
    const v = Number(localStorage.getItem(keyRate) || '1.0')
    return Number.isFinite(v) ? v : 1.0
  })

  useEffect(() => {
    return () => {
      stopSpeak()
      setIsSpeaking(false)
    }
  }, [])

  useEffect(() => {
    if (!supported || !autoPlay || !text?.trim()) return

    ;(async () => {
      try {
        setIsSpeaking(true)
        await speak(text, { lang: 'ja-JP', rate, pitch: 1.0 })
      } catch {
      } finally {
        setIsSpeaking(false)
      }
    })()
  }, [supported, autoPlay, text, rate])

  const onPlay = async () => {
    if (!supported || !text?.trim()) return
    try {
      setIsSpeaking(true)
      await speak(text, { lang: 'ja-JP', rate, pitch: 1.0 })
    } finally {
      setIsSpeaking(false)
    }
  }

  const onStop = () => {
    stopSpeak()
    setIsSpeaking(false)
  }

  const onReplay = async () => {
    onStop()
    await onPlay()
  }

  const toggleAuto = () => {
    const next = !autoPlay
    setAutoPlay(next)
    if (typeof window !== 'undefined') localStorage.setItem(keyAuto, next ? '1' : '0')
  }

  const changeRate = (next: number) => {
    setRate(next)
    if (typeof window !== 'undefined') localStorage.setItem(keyRate, String(next))
  }

  if (!text?.trim()) return null

  return (
    <div style={{ margin: '12px 0' }}>
      {/* ▶️ ⏹ 🔁 横並び */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 120 }}>
          <Button variant="main" onClick={onPlay} disabled={!supported || isSpeaking}>
            {isSpeaking ? '🔊 再生中…' : '▶️ 再生'}
          </Button>
        </div>

        <div style={{ flex: 1, minWidth: 120 }}>
          <Button variant="accent" onClick={onStop} disabled={!supported}>
            ⏹ 停止
          </Button>
        </div>

        <div style={{ flex: 1, minWidth: 120 }}>
          <Button variant="success" onClick={onReplay} disabled={!supported}>
            🔁 もう一度
          </Button>
        </div>
      </div>

      {/* 設定系は下に */}
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={autoPlay} onChange={toggleAuto} />
          自動再生
        </label>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ opacity: 0.7 }}>速度</span>
          {[0.9, 1.0, 1.1].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => changeRate(v)}
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.12)',
                background: rate === v ? 'rgba(0,0,0,0.85)' : 'transparent',
                color: rate === v ? '#fff' : 'inherit',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {v.toFixed(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
