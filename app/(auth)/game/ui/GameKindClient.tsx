"use client"

import { useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"

type Kind =
  | "tile-drop"
  | "flash-judge"
  | "memory-burst"

function normalizeKind(v: unknown): string {
  const s = String(v ?? "")
  let t = s

  try {
    t = decodeURIComponent(s)
  } catch {}

  t = t.split("?")[0].split("#")[0]

  return t.trim().toLowerCase()
}

function toKind(v: unknown): Kind {
  const k = normalizeKind(v)

  if (k === "tile-drop") return "tile-drop"
  if (k === "flash-judge") return "flash-judge"
  if (k === "memory-burst") return "memory-burst"

  if (k === "flashjudge") return "flash-judge"
  if (k === "memoryburst") return "memory-burst"

  return "tile-drop"
}

function kindMeta(kind: Kind) {
  if (kind === "tile-drop") {
    return {
      title: "文字ブレイク",
      desc: "落ちてくる問題を正しい順番で破壊するゲーム",
    }
  }

  if (kind === "flash-judge") {
    return {
      title: "瞬判ジャッジ",
      desc: "文が正しいか瞬時に○×で判断",
    }
  }

  return {
    title: "フラッシュ記憶",
    desc: "一瞬表示された問題を記憶して回答",
  }
}

export default function GameKindClient() {
  const router = useRouter()
  const pathname = usePathname()

  // /game/flash-judge → flash-judge
  const kindFromPath = useMemo(() => {
    const seg = pathname.split("/").filter(Boolean).pop()
    return seg ?? ""
  }, [pathname])

  const safeKind = useMemo(() => {
    return toKind(kindFromPath)
  }, [kindFromPath])

  const meta = useMemo(() => {
    return kindMeta(safeKind)
  }, [safeKind])

  function startGame() {
    const qs = new URLSearchParams({
      kind: safeKind,
      type: "japanese-n4",
      mode: "normal",
      autostart: "1",
    })

    router.push(`/game/play?${qs}`)
  }

  return (
    <main style={{ padding: 20 }}>

      {/* debug */}
      <div
        style={{
          position: "fixed",
          top: 8,
          right: 8,
          background: "#000",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: 8,
          fontSize: 12,
          zIndex: 9999,
        }}
      >
        pathname={pathname}
        <br />
        safeKind={safeKind}
      </div>

      <h1>{meta.title}</h1>

      <p>{meta.desc}</p>

      <button
        onClick={startGame}
        style={{
          marginTop: 20,
          padding: "10px 18px",
          fontWeight: "bold",
        }}
      >
        プレイ開始
      </button>

    </main>
  )
}