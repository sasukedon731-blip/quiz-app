"use client"

import { useState } from "react"
import Link from "next/link"

type TopGroupItem = {
  id: string
  title: string
  description: string
  href: string
}

type TopGroup = {
  id: string
  title: string
  description?: string
  items?: TopGroupItem[]
}

type IndustryCard = {
  id: string
  icon: string
  title: string
  subtitle: string
  groups?: TopGroup[]
  href?: string
}

const constructionVocabularyItems: TopGroupItem[] = [
  {
    id: "construction-tools",
    title: "建設道具",
    description: "道具の名前や使い方を学ぶ",
    href: "/select-mode?quizType=construction-tools",
  },
  {
    id: "architecture-terms",
    title: "建築",
    description: "建築分野の重要用語",
    href: "/select-mode?quizType=architecture-terms",
  },
  {
    id: "civil-terms",
    title: "土木",
    description: "土木分野の重要用語",
    href: "/select-mode?quizType=civil-terms",
  },
  {
    id: "electric-terms",
    title: "電気",
    description: "電気分野の重要用語",
    href: "/select-mode?quizType=electric-terms",
  },
  {
    id: "hvac-terms",
    title: "空調衛生",
    description: "空調・衛生分野の重要用語",
    href: "/select-mode?quizType=hvac-terms",
  },
  {
    id: "plant-terms",
    title: "プラント",
    description: "プラント分野の重要用語",
    href: "/select-mode?quizType=plant-terms",
  },
  {
    id: "construction-management-terms",
    title: "施工管理",
    description: "施工管理で使う重要用語",
    href: "/select-mode?quizType=construction-management-terms",
  },
]

const constructionExamItems: TopGroupItem[] = [
  {
    id: "kenchiku-sekou-2kyu-1ji",
    title: "2級建築施工管理",
    description: "建築施工管理技士 1次対策",
    href: "/select-mode?quizType=kenchiku-sekou-2kyu-1ji",
  },
  {
    id: "doboku-sekou-2kyu-1ji",
    title: "2級土木施工管理",
    description: "土木施工管理技士 1次対策",
    href: "/select-mode?quizType=doboku-sekou-2kyu-1ji",
  },
  {
    id: "denki-sekou-2kyu-1ji",
    title: "2級電気施工管理",
    description: "電気施工管理技士 1次対策",
    href: "/select-mode?quizType=denki-sekou-2kyu-1ji",
  },
  {
    id: "kanko-sekou-2kyu-1ji",
    title: "2級管工事施工管理",
    description: "管工事施工管理技士 1次対策",
    href: "/select-mode?quizType=kanko-sekou-2kyu-1ji",
  },
]

const constructionJapaneseItems: TopGroupItem[] = [
  {
    id: "genba-listening",
    title: "現場日本語リスニング",
    description: "現場の聞き取りを強化",
    href: "/select-mode?quizType=genba-listening",
  },
  {
    id: "genba-phrasebook",
    title: "現場日本語フレーズ",
    description: "現場で使う言い方を学ぶ",
    href: "/select-mode?quizType=genba-phrasebook",
  },
]

const jlptItems: TopGroupItem[] = [
  {
    id: "japanese-n4",
    title: "日本語N4",
    description: "基礎日本語",
    href: "/select-mode?quizType=japanese-n4",
  },
  {
    id: "japanese-n3",
    title: "日本語N3",
    description: "中級日本語",
    href: "/select-mode?quizType=japanese-n3",
  },
  {
    id: "japanese-n2",
    title: "日本語N2",
    description: "上級日本語",
    href: "/select-mode?quizType=japanese-n2",
  },
  {
    id: "speaking-practice",
    title: "スピーキング",
    description: "話す練習",
    href: "/select-mode?quizType=speaking-practice",
  },
]

const industryCards: IndustryCard[] = [
  {
    id: "construction",
    icon: "👷",
    title: "建設で働く方へ",
    subtitle: "建設用語・施工管理試験・現場日本語・日本語N4〜N2",
    groups: [
      {
        id: "construction-jlpt",
        title: "日本語検定を学ぶ",
        description: "N4・N3・N2・スピーキング",
        items: jlptItems,
      },
      {
        id: "construction-vocabulary",
        title: "建設用語を学ぶ",
        description: "道具・建築・土木・電気・空調衛生・プラント・施工管理",
        items: constructionVocabularyItems,
      },
      {
        id: "construction-exams",
        title: "施工管理試験を学ぶ",
        description: "2級施工管理技士の試験対策",
        items: constructionExamItems,
      },
      {
        id: "construction-japanese",
        title: "現場日本語を学ぶ",
        description: "聞き取り・フレーズ・会話",
        items: constructionJapaneseItems,
      },
      {
        id: "construction-battle",
        title: "日本語バトル",
        description: "非会員は1日1回、会員は無制限",
        items: [
          {
            id: "battle",
            title: "日本語バトルをプレイ",
            description: "語彙・文法・判断・記憶ゲーム",
            href: "/game",
          },
        ],
      },
    ],
  },
  {
    id: "manufacturing",
    icon: "🏭",
    title: "製造で働く方へ",
    subtitle: "用語・現場会話・技能試験・日本語N4〜N2",
    href: "/select-mode?industry=manufacturing",
  },
  {
    id: "care",
    icon: "👵",
    title: "介護で働く方へ",
    subtitle: "介護用語・現場会話・国家試験・日本語N4〜N2",
    href: "/select-mode?industry=care",
  },
  {
    id: "driver",
    icon: "🚗",
    title: "運転・免許が必要な方へ",
    subtitle: "交通ルール・道路標識・日本語N4〜N2",
    href: "/select-mode?industry=driver",
  },
  {
    id: "undecided",
    icon: "🌱",
    title: "まだ決まっていない方へ",
    subtitle: "まずは日本語N4〜N2と基礎学習から",
    href: "/select-mode?industry=undecided",
  },
]

function GroupBlock({
  group,
  compact = false,
}: {
  group: TopGroup
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        border: "1px solid #dbe4ff",
        borderRadius: 18,
        background: "#fff",
        padding: compact ? 12 : 14,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 0,
          textAlign: "left",
        }}
      >
        <div>
          <div
            style={{
              fontSize: compact ? 17 : 18,
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            {group.title}
          </div>
          {group.description ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                lineHeight: 1.5,
                color: "#64748b",
              }}
            >
              {group.description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            marginLeft: 12,
            fontSize: 24,
            fontWeight: 900,
            color: "#38bdf8",
          }}
        >
          {open ? "−" : "+"}
        </div>
      </button>

      {open && group.items?.length ? (
        <div
          style={{
            display: "grid",
            gap: 10,
            marginTop: 12,
          }}
        >
          {group.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "block",
                textDecoration: "none",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                background: "#f8fafc",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "#64748b",
                }}
              >
                {item.description}
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function IndustryCardBlock({ card }: { card: IndustryCard }) {
  const [open, setOpen] = useState(false)
  const hasGroups = !!card.groups?.length

  if (!hasGroups && card.href) {
    return (
      <Link
        href={card.href}
        style={{
          display: "block",
          textDecoration: "none",
          borderRadius: 24,
          background: "#fff",
          border: "1px solid #dbe4ff",
          padding: 18,
          boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: "#0f172a",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            {card.icon}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#38bdf8",
              }}
            >
              {card.title}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                lineHeight: 1.6,
                color: "#64748b",
              }}
            >
              {card.subtitle}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div
      style={{
        borderRadius: 24,
        background: "#fff",
        border: "1px solid #dbe4ff",
        padding: 18,
        boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: "#0f172a",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            {card.icon}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#38bdf8",
              }}
            >
              {card.title}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                lineHeight: 1.6,
                color: "#64748b",
              }}
            >
              {card.subtitle}
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: "#38bdf8",
            flexShrink: 0,
          }}
        >
          {open ? "−" : "+"}
        </div>
      </button>

      {open && card.groups?.length ? (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 12,
          }}
        >
          {card.groups.map((group) => (
            <GroupBlock key={group.id} group={group} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function BattleHero() {
  return (
    <section
      style={{
        borderRadius: 28,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#fff",
        padding: 24,
        boxShadow: "0 14px 30px rgba(15, 23, 42, 0.18)",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#7dd3fc",
          letterSpacing: "0.04em",
        }}
      >
        目玉コンテンツ
      </div>

      <h1
        style={{
          marginTop: 8,
          fontSize: 34,
          lineHeight: 1.2,
          fontWeight: 900,
        }}
      >
        🎮 日本語バトル
      </h1>

      <p
        style={{
          marginTop: 12,
          fontSize: 15,
          lineHeight: 1.8,
          color: "#dbeafe",
        }}
      >
        語彙・文法・判断・記憶をゲームで鍛える、日本語バトルのメインモード。
        <br />
        非会員は1日1回、会員は何回でもプレイできます。
      </p>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 18,
        }}
      >
        <Link
          href="/game"
          style={{
            textDecoration: "none",
            background: "#38bdf8",
            color: "#0f172a",
            padding: "12px 18px",
            borderRadius: 14,
            fontWeight: 900,
          }}
        >
          ゲームをプレイ
        </Link>

        <Link
          href="/mypage"
          style={{
            textDecoration: "none",
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 14,
            fontWeight: 800,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          ランキングを見る
        </Link>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "20px 16px 48px",
      }}
    >
      <div style={{ display: "grid", gap: 18 }}>
        <BattleHero />

        <section
          style={{
            borderRadius: 28,
            border: "1px solid #dbe4ff",
            background: "#f5f7ff",
            padding: 18,
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              業種別で探す
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                lineHeight: 1.7,
                color: "#64748b",
              }}
            >
              どの業種を選んでも、日本語N4〜N2と日本語バトルを学習に組み込めます。
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {industryCards.map((card) => (
              <IndustryCardBlock key={card.id} card={card} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}