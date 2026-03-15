"use client"

import { useRouter, useSearchParams } from "next/navigation"
import QuizLayout from "@/app/components/QuizLayout"
import Button from "@/app/components/Button"
import type { QuizType } from "@/app/data/types"
import { quizCatalog } from "@/app/data/quizCatalog"

function badgeByType(type: string) {
  if (type === "japanese-n4") return { title: "日本語検定N4", badge: "N4", color: "#5b21b6" }
  if (type === "japanese-n3") return { title: "日本語N3", badge: "N3", color: "#4338ca" }
  if (type === "japanese-n2") return { title: "日本語N2", badge: "N2", color: "#1e40af" }

  if (type === "genba-listening") return { title: "現場用語リスニング", badge: "現場", color: "#92400e" }
  if (type === "genba-phrasebook") return { title: "現場用語集（聞く/話す）", badge: "用語", color: "#9a3412" }

  if (type === "kenchiku-sekou-2kyu-1ji") return { title: "2級建築施工管理技士1次", badge: "建築", color: "#065f46" }
  if (type === "doboku-sekou-2kyu-1ji") return { title: "2級土木施工管理技士1次", badge: "土木", color: "#0f766e" }
  if (type === "denki-sekou-2kyu-1ji") return { title: "2級電気施工管理技士1次", badge: "電気", color: "#0e7490" }
  if (type === "kanko-sekou-2kyu-1ji") return { title: "2級管工事施工管理技士1次", badge: "管工", color: "#1d4ed8" }

  if (type === "speaking-practice") return { title: "AI会話トレーニング", badge: "話す", color: "#be185d" }

  const fromCatalog = quizCatalog.find((q) => q.id === type)
  return { title: fromCatalog?.title ?? type, badge: "QUIZ", color: "#111827" }
}

export default function SelectModeClient() {
  const router = useRouter()
  const params = useSearchParams()
  const type = params.get("type") as QuizType | null

  if (!type) {
    return (
      <QuizLayout title="モード選択">
        <p>教材が選択されていません</p>
        <div style={{ display: "grid", gap: 10 }}>
          <Button variant="success" onClick={() => router.push("/mypage")}>
            マイページへ
          </Button>
          <Button variant="main" onClick={() => router.push("/")}>
            TOPへ
          </Button>
        </div>
      </QuizLayout>
    )
  }

  const meta = badgeByType(type)
  const isSpeaking = type === "speaking-practice"

  return (
    <QuizLayout title="モード選択" subtitle={meta.title}>
      <div style={{ marginBottom: 12 }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "white",
            fontWeight: 900,
          }}
        >
          <span style={{ color: meta.color }}>●</span> {meta.badge}
        </span>
      </div>

      {isSpeaking ? (
        <>
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 14,
              lineHeight: 1.8,
            }}
          >
            母国語で入力 → AIが自然な日本語を提案 → 音声で発話 → AIが評価する、会話練習専用の教材です。
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <Button variant="main" onClick={() => router.push("/speaking")}>
              AI会話トレーニングを始める
            </Button>
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <Button variant="main" onClick={() => router.push(`/normal?type=${encodeURIComponent(type)}`)}>
            標準問題（Normal）
          </Button>

          <Button variant="accent" onClick={() => router.push(`/exam?type=${encodeURIComponent(type)}`)}>
            模擬試験（Exam）
          </Button>

          <Button variant="success" onClick={() => router.push(`/review?type=${encodeURIComponent(type)}`)}>
            復習（Review）
          </Button>
        </div>
      )}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <Button variant="success" onClick={() => router.push("/mypage")}>
          マイページへ戻る
        </Button>

        <Button variant="main" onClick={() => router.push("/")}>
          TOPへ戻る
        </Button>
      </div>
    </QuizLayout>
  )
}
