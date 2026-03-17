"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/useAuth"
import {
  ConversationHistoryItem,
  getConversationHistory,
} from "@/app/lib/getConversationHistory"

function formatDate(date: Date | null) {
  if (!date) return "-"
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const mm = String(date.getMinutes()).padStart(2, "0")
  return `${y}/${m}/${d} ${hh}:${mm}`
}

function toDisplayScore(value?: number | string) {
  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(100, Math.round(num)))
}

export default function ConversationHistoryPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [items, setItems] = useState<ConversationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")
        const rows = await getConversationHistory(user.uid, 50)
        setItems(rows)
      } catch (e: any) {
        console.error(e)
        setError(e?.message || "履歴の取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.uid])

  const averageScore = useMemo(() => {
    if (!items.length) return 0
    return Math.round(
      items.reduce((sum, item) => sum + Number(item.totalScore || 0), 0) /
        items.length
    )
  }, [items])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "20px 16px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#111827",
                marginBottom: 6,
              }}
            >
              AI会話履歴
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#6b7280",
              }}
            >
              これまでの会話練習とスコアを確認できます
            </div>
          </div>

          <button
            onClick={() => router.push("/mypage")}
            style={{
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            マイページへ戻る
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <SummaryCard title="会話回数" value={`${items.length}回`} />
          <SummaryCard title="平均スコア" value={`${averageScore}点`} />
        </div>

        {loading ? (
          <Panel>
            <div
              style={{
                fontSize: 14,
                color: "#6b7280",
                fontWeight: 700,
              }}
            >
              履歴を読み込み中...
            </div>
          </Panel>
        ) : null}

        {!loading && error ? (
          <Panel>
            <div
              style={{
                fontSize: 14,
                color: "#b91c1c",
                fontWeight: 700,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error}
            </div>
          </Panel>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <Panel>
            <div
              style={{
                fontSize: 15,
                color: "#111827",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              まだ会話履歴がありません
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.7,
              }}
            >
              AI会話レッスンを完了すると、ここに履歴が保存されます。
            </div>
          </Panel>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div style={{ display: "grid", gap: 14 }}>
            {items.map((item) => {
              const open = openId === item.id

              return (
                <div
                  key={item.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 18,
                    padding: 18,
                    boxShadow: "0 10px 30px rgba(17,24,39,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 10,
                        }}
                      >
                        <Badge>{item.themeLabel || item.theme}</Badge>
                        <Badge>{item.levelLabel || item.level}</Badge>
                        <BadgeDark>{item.totalScore}点</BadgeDark>
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          marginBottom: 10,
                          fontWeight: 700,
                        }}
                      >
                        {formatDate(item.createdAt)}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(140px, 1fr))",
                          gap: 10,
                        }}
                      >
                        <MiniStat
                          label="伝わりやすさ"
                          value={`${toDisplayScore(item.evaluation?.clarity)}点`}
                        />
                        <MiniStat
                          label="自然さ"
                          value={`${toDisplayScore(item.evaluation?.naturalness)}点`}
                        />
                        <MiniStat
                          label="丁寧さ"
                          value={`${toDisplayScore(item.evaluation?.politeness)}点`}
                        />
                        <MiniStat
                          label="会話継続力"
                          value={`${toDisplayScore(item.evaluation?.continuity)}点`}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setOpenId(open ? null : item.id)}
                      style={{
                        border: "none",
                        background: open ? "#111827" : "#22c55e",
                        color: "#ffffff",
                        borderRadius: 12,
                        padding: "12px 16px",
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {open ? "閉じる" : "詳細を見る"}
                    </button>
                  </div>

                  {open ? (
                    <div style={{ marginTop: 16 }}>
                      {!!item.evaluation?.goodPoints?.length && (
                        <SectionBox
                          title="良かったところ"
                          items={item.evaluation.goodPoints}
                        />
                      )}

                      {!!item.evaluation?.nextTips?.length && (
                        <SectionBox
                          title="次に意識すること"
                          items={item.evaluation.nextTips}
                        />
                      )}

                      {item.evaluation?.comment ? (
                        <div
                          style={{
                            marginTop: 12,
                            background: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            borderRadius: 14,
                            padding: 14,
                            fontSize: 14,
                            color: "#374151",
                            lineHeight: 1.8,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {item.evaluation.comment}
                        </div>
                      ) : null}

                      <div
                        style={{
                          marginTop: 14,
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 14,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "#111827",
                            marginBottom: 10,
                          }}
                        >
                          会話ログ
                        </div>

                        <div style={{ display: "grid", gap: 10 }}>
                          {item.messages.map((msg, index) => {
                            const isAi = msg.role === "ai"
                            return (
                              <div
                                key={`${item.id}_${index}`}
                                style={{
                                  display: "flex",
                                  justifyContent: isAi
                                    ? "flex-start"
                                    : "flex-end",
                                }}
                              >
                                <div
                                  style={{
                                    maxWidth: "80%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: isAi
                                      ? "flex-start"
                                      : "flex-end",
                                    gap: 4,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: "#6b7280",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {isAi ? "AI" : "あなた"}
                                  </div>
                                  <div
                                    style={{
                                      background: isAi
                                        ? "#ffffff"
                                        : "#22c55e",
                                      color: isAi ? "#111827" : "#ffffff",
                                      border: isAi
                                        ? "1px solid #e5e7eb"
                                        : "none",
                                      borderRadius: 16,
                                      padding: "10px 12px",
                                      fontSize: 14,
                                      lineHeight: 1.8,
                                      whiteSpace: "pre-wrap",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 10px 30px rgba(17,24,39,0.05)",
      }}
    >
      {children}
    </div>
  )
}

function SummaryCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 10px 30px rgba(17,24,39,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#111827",
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {children}
    </div>
  )
}

function BadgeDark({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#111827",
        color: "#ffffff",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {children}
    </div>
  )
}

function MiniStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          color: "#111827",
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function SectionBox({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div
      style={{
        marginTop: 12,
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: "#111827",
          fontWeight: 800,
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item, index) => (
          <div
            key={`${title}_${index}`}
            style={{
              fontSize: 14,
              color: "#374151",
              lineHeight: 1.7,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}