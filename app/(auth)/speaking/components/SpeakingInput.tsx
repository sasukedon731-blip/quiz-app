"use client"

import { useState } from "react"

type Props = {
  onGenerate: (args: {
    sourceLanguage: string
    sourceText: string
    scene: string
    politeness: string
  }) => void
  loading?: boolean
}

const MAX_TEXT_LENGTH = 80

export default function SpeakingInput({ onGenerate, loading = false }: Props) {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("en")
  const [scene, setScene] = useState("work")
  const [politeness, setPoliteness] = useState("polite")

  const disabled = loading || !text.trim()

  return (
    <div style={styles.wrap}>
      <div style={styles.grid}>
        <label style={styles.labelBlock}>
          <div style={styles.label}>言語</div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.select}
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="my">Myanmar</option>
          </select>
        </label>

        <label style={styles.labelBlock}>
          <div style={styles.label}>場面</div>
          <select
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            style={styles.select}
          >
            <option value="work">Work</option>
            <option value="daily">Daily</option>
            <option value="interview">Interview</option>
          </select>
        </label>
      </div>

      <label style={styles.labelBlock}>
        <div style={styles.label}>言いたいこと</div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
          placeholder="例: HELLO / Nice to meet you / I will be late tomorrow"
          style={styles.textarea}
        />

        <div style={styles.helpText}>
          短い文のほうが、自然で話しやすい候補を作りやすいです。
        </div>

        <div
          style={{
            ...styles.counter,
            color: text.length >= MAX_TEXT_LENGTH ? "#dc2626" : "#64748b",
          }}
        >
          {text.length} / {MAX_TEXT_LENGTH}
        </div>
      </label>

      <label style={styles.labelBlock}>
        <div style={styles.label}>丁寧さ</div>
        <select
          value={politeness}
          onChange={(e) => setPoliteness(e.target.value)}
          style={styles.select}
        >
          <option value="polite">ていねい</option>
          <option value="casual">ややカジュアル</option>
          <option value="formal">かなりていねい</option>
        </select>
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onGenerate({
            sourceLanguage: language,
            sourceText: text,
            scene,
            politeness,
          })
        }
        style={{
          ...styles.primaryButton,
          ...(disabled ? styles.primaryButtonDisabled : null),
        }}
      >
        {loading ? "日本語候補を作成中..." : "日本語候補を2つ作る"}
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "grid",
    gap: 16,
  },
  grid: {
    display: "grid",
    gap: 16,
  },
  labelBlock: {
    display: "block",
  },
  label: {
    fontSize: 16,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 8,
  },
  select: {
    width: "100%",
    height: 58,
    borderRadius: 20,
    border: "1px solid #d9e0ea",
    background: "#ffffff",
    padding: "0 18px",
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    outline: "none",
  },
  textarea: {
    width: "100%",
    minHeight: 150,
    borderRadius: 22,
    border: "1px solid #d9e0ea",
    background: "#ffffff",
    padding: "16px 18px",
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  helpText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#64748b",
  },
  counter: {
    marginTop: 6,
    textAlign: "right",
    fontSize: 13,
    fontWeight: 800,
  },
  primaryButton: {
    width: "100%",
    height: 60,
    borderRadius: 20,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(37,99,235,0.22)",
    marginTop: 4,
  },
  primaryButtonDisabled: {
    background: "#94a3b8",
    boxShadow: "none",
    cursor: "not-allowed",
  },
}