// app/lib/tts.ts

export type SpeakOptions = {
  lang?: string
  rate?: number
  pitch?: number
}

export function canSpeak(): boolean {
  if (typeof window === "undefined") return false
  return !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== "undefined"
}

export function stopSpeak() {
  if (typeof window === "undefined") return
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

export function speak(text: string, options: SpeakOptions = {}) {
  if (!text) return
  if (!canSpeak()) return

  const uttr = new SpeechSynthesisUtterance(text)
  uttr.lang = options.lang ?? "ja-JP"
  uttr.rate = options.rate ?? 0.9
  uttr.pitch = options.pitch ?? 1.0

  // 連打対策
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(uttr)
}
