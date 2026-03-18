"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import Button from "@/app/components/Button"
import { useAuth } from "@/app/lib/useAuth"
import { quizCatalog } from "@/app/data/quizCatalog"

type IndustryId = "construction" | "manufacturing" | "care" | "driver" | "undecided"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // ✅ Mobile判定
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener?.("change", apply)
    return () => mq.removeEventListener?.("change", apply)
  }, [])

  // ✅ ハンバーガー
  const [menuOpen, setMenuOpen] = useState(false)

  // ✅ industry をURLに付ける helper
  const withIndustry = (path: string, industry?: string | null) => {
    if (!industry) return path
    const join = path.includes("?") ? "&" : "?"
    return `${path}${join}industry=${encodeURIComponent(industry)}`
  }

  const cta = () => {
  if (loading) return
  if (!user) {
    router.push("/login")
    return
  }

  const industry = resolveIndustry()
  router.push(withIndustry("/select-mode", industry))
}

  // ✅ ゲームへ（ゲストOK）
  const goJapaneseBattle = () => {
    router.push("/game?mode=normal")
  }

  const goSpeaking = () => {
    router.push("/speaking")
  }

  const closeMenu = () => setMenuOpen(false)

  // =========================
  // ✅ 業種別（教材セクション用）
  // =========================

  const JAPANESE_BASE_IDS = useMemo(
    () => ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice"] as const,
    []
  )

  type QuizGroup = {
    id: string
    title: string
    description: string
    quizIds?: string[]
    href?: string
    ctaTitle?: string
    ctaDescription?: string
  }

  type IndustryCard = {
    id: IndustryId
    icon: string
    title: string
    subtitle: string
    extraQuizIds: string[]
    groups?: QuizGroup[]
  }

  const INDUSTRIES: IndustryCard[] = useMemo(
    () => [
      {
        id: "construction",
        icon: "👷",
        title: "建設で働く方へ",
        subtitle: "建設用語・施工管理試験・現場日本語・方言学習・日本語N4〜N2・日本語バトル",
        extraQuizIds: [
          "japanese-n4",
          "japanese-n3",
          "japanese-n2",
          "speaking-practice",
          "genba-listening",
          "genba-phrasebook",
          "construction-tools",
          "hvac-terms",
          "plant-terms",
          "architecture-terms",
          "construction-management-terms",
          "electric-terms",
          "civil-terms",
          "kenchiku-sekou-2kyu-1ji",
          "doboku-sekou-2kyu-1ji",
          "denki-sekou-2kyu-1ji",
          "kanko-sekou-2kyu-1ji",
          "kansai-listening",
          "dialect-meaning",
        ],
        groups: [
          {
            id: "construction-jlpt",
            title: "日本語検定を学ぶ",
            description: "N4・N3・N2・スピーキング",
            quizIds: ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice"],
          },
          {
            id: "construction-vocabulary",
            title: "建設用語を学ぶ",
            description: "道具・建築・土木・電気・空調衛生・プラント・施工管理",
            quizIds: [
              "construction-tools",
              "architecture-terms",
              "civil-terms",
              "electric-terms",
              "hvac-terms",
              "plant-terms",
              "construction-management-terms",
            ],
          },
          {
            id: "construction-exams",
            title: "施工管理試験を学ぶ",
            description: "2級建築・土木・電気・管工事施工管理",
            quizIds: [
              "kenchiku-sekou-2kyu-1ji",
              "doboku-sekou-2kyu-1ji",
              "denki-sekou-2kyu-1ji",
              "kanko-sekou-2kyu-1ji",
            ],
          },
          {
            id: "construction-japanese",
            title: "現場日本語を学ぶ",
            description: "現場用語・聞き取り・会話",
            quizIds: ["genba-listening", "genba-phrasebook"],
          },
          {
            id: "construction-dialect",
            title: "全国の方言を学ぶ",
            description: "関西弁リスニングと全国方言の意味当て",
            quizIds: ["kansai-listening", "dialect-meaning"],
          },
          {
            id: "construction-battle",
            title: "日本語バトルをプレイ",
            description: "語彙・文法・判断・記憶ゲーム（非会員1日1回 / 会員無制限）",
            href: "/game?mode=normal",
            ctaTitle: "日本語バトル",
            ctaDescription: "今すぐプレイする",
          },
        ],
      },
      {
        id: "manufacturing",
        icon: "🏭",
        title: "製造で働く方へ",
        subtitle: "用語・現場会話・技能試験・方言学習・日本語N4〜N2・日本語バトル",
        extraQuizIds: [
          "japanese-n4",
          "japanese-n3",
          "japanese-n2",
          "speaking-practice",
          "manufacturing-meaning",
          "manufacturing-word",
          "manufacturing-listening",
          "manufacturing-conversation",
          "manufacturing-conversation-50",
          "skill-test-machining",
          "kansai-listening",
          "dialect-meaning",
        ],
        groups: [
          {
            id: "manufacturing-jlpt",
            title: "日本語検定を学ぶ",
            description: "N4・N3・N2・スピーキング",
            quizIds: ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice"],
          },
          {
            id: "manufacturing-practice",
            title: "製造用語・会話を学ぶ",
            description: "製造用語・リスニング・現場会話",
            quizIds: [
              "manufacturing-meaning",
              "manufacturing-word",
              "manufacturing-listening",
              "manufacturing-conversation",
              "manufacturing-conversation-50",
            ],
          },
          {
            id: "manufacturing-skill-test",
            title: "技能試験を学ぶ",
            description: "技能検定 機械加工 学科",
            quizIds: ["skill-test-machining"],
          },
          {
            id: "manufacturing-dialect",
            title: "全国の方言を学ぶ",
            description: "関西弁リスニングと全国方言の意味当て",
            quizIds: ["kansai-listening", "dialect-meaning"],
          },
          {
            id: "manufacturing-battle",
            title: "日本語バトルをプレイ",
            description: "語彙・文法・判断・記憶ゲーム（非会員1日1回 / 会員無制限）",
            href: "/game?mode=normal",
            ctaTitle: "日本語バトル",
            ctaDescription: "今すぐプレイする",
          },
        ],
      },
      {
        id: "care",
        icon: "👵",
        title: "介護で働く方へ",
        subtitle: "介護用語・現場会話・国家試験・方言学習・日本語N4〜N2・日本語バトル",
        extraQuizIds: ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice", "care-terms", "care-listening", "care-conversation", "care-worker-exam", "kansai-listening", "dialect-meaning"],
        groups: [
          {
            id: "care-jlpt",
            title: "日本語検定を学ぶ",
            description: "N4・N3・N2・スピーキング",
            quizIds: ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice"],
          },
          {
            id: "care-practice",
            title: "介護用語・会話を学ぶ",
            description: "介護用語・リスニング・現場会話",
            quizIds: ["care-terms", "care-listening", "care-conversation"],
          },
          {
  id: "care-exam",
  title: "介護福祉士試験",
  description: "国家試験レベルの問題",
  quizIds: ["care-worker-exam"],
},
          {
            id: "care-dialect",
            title: "全国の方言を学ぶ",
            description: "関西弁リスニングと全国方言の意味当て",
            quizIds: ["kansai-listening", "dialect-meaning"],
          },
          {
            id: "care-battle",
            title: "日本語バトルをプレイ",
            description: "語彙・文法・判断・記憶ゲーム（非会員1日1回 / 会員無制限）",
            href: "/game?mode=normal",
            ctaTitle: "日本語バトル",
            ctaDescription: "今すぐプレイする",
          },
        ],
      },
      {
        id: "driver",
        icon: "🚗",
        title: "運転・免許が必要な方へ",
        subtitle: "交通ルール・道路標識・方言学習・日本語N4〜N2・日本語バトル",
        extraQuizIds: ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice", "gaikoku-license", "road-signs", "kansai-listening", "dialect-meaning"],
        groups: [
          {
            id: "driver-jlpt",
            title: "日本語検定を学ぶ",
            description: "N4・N3・N2・スピーキング",
            quizIds: ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice"],
          },
          {
            id: "driver-license",
            title: "交通ルール・道路標識を学ぶ",
            description: "外国免許切替・道路標識",
            quizIds: ["gaikoku-license", "road-signs"],
          },
          {
            id: "driver-dialect",
            title: "全国の方言を学ぶ",
            description: "関西弁リスニングと全国方言の意味当て",
            quizIds: ["kansai-listening", "dialect-meaning"],
          },
          {
            id: "driver-battle",
            title: "日本語バトルをプレイ",
            description: "語彙・文法・判断・記憶ゲーム（非会員1日1回 / 会員無制限）",
            href: "/game?mode=normal",
            ctaTitle: "日本語バトル",
            ctaDescription: "今すぐプレイする",
          },
        ],
      },
      {
        id: "undecided",
        icon: "🌱",
        title: "まだ決まっていない方へ",
        subtitle: "まずは日本語N4〜N2・全国の方言・基礎学習・日本語バトルから",
        extraQuizIds: ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice", "kansai-listening", "dialect-meaning"],
        groups: [
          {
            id: "undecided-jlpt",
            title: "日本語検定を学ぶ",
            description: "N4・N3・N2・スピーキング",
            quizIds: ["japanese-n4", "japanese-n3", "japanese-n2", "speaking-practice"],
          },
          {
            id: "undecided-dialect",
            title: "全国の方言を学ぶ",
            description: "関西弁リスニングと全国方言の意味当て",
            quizIds: ["kansai-listening", "dialect-meaning"],
          },
          {
            id: "undecided-battle",
            title: "日本語バトルをプレイ",
            description: "語彙・文法・判断・記憶ゲーム（非会員1日1回 / 会員無制限）",
            href: "/game?mode=normal",
            ctaTitle: "日本語バトル",
            ctaDescription: "今すぐプレイする",
          },
        ],
      },
    ],
    []
  )

  const [openIndustryId, setOpenIndustryId] = useState<IndustryId | null>(null)
  const [openGroupIds, setOpenGroupIds] = useState<Record<string, boolean>>({})
  // ✅ localStorage “確実修正”
  const LS_INDUSTRY_KEY = "selected-industry"
  const saveIndustry = (id: IndustryId) => {
    try {
      localStorage.setItem(LS_INDUSTRY_KEY, id)
    } catch {}
  }
  const loadIndustry = () => {
    try {
      return localStorage.getItem(LS_INDUSTRY_KEY) as IndustryId | null
    } catch {
      return null
    }
  }
  const resolveIndustry = (): IndustryId => {
    return loadIndustry() || openIndustryId || "undecided"
  }

  const enabledCatalog = useMemo(() => {
    return quizCatalog.filter((q) => q.enabled).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  }, [])

  const getItemsForIndustry = (ind: IndustryCard) => {
    const base = enabledCatalog.filter((q) => (JAPANESE_BASE_IDS as readonly string[]).includes(q.id))
    const extra = enabledCatalog.filter((q) => ind.extraQuizIds.includes(q.id))
    const merged = [...base, ...extra].filter(
      (q, idx, arr) => arr.findIndex((x) => x.id === q.id) === idx
    )
    return merged.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  }

  const getItemsForGroup = (quizIds: string[] = []) => {
    return enabledCatalog
      .filter((q) => quizIds.includes(q.id))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  }

  const toggleIndustry = (id: IndustryId) => {
    setOpenIndustryId((prev) => {
      if (prev === id) {
        setOpenGroupIds({})
        return null
      }
      setOpenGroupIds({})
      return id
    })
  }

  const toggleGroup = (industryId: IndustryId, groupId: string) => {
    const key = `${industryId}:${groupId}`
    setOpenGroupIds((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <main style={styles.page}>
      {menuOpen ? <div style={styles.overlay} onClick={closeMenu} /> : null}

      {menuOpen ? (
        <aside style={styles.drawer} aria-label="menu">
          <div style={styles.drawerTop}>
            <div style={{ fontWeight: 900 }}>メニュー</div>
            <button style={styles.drawerClose} onClick={closeMenu} aria-label="close">
              ✕
            </button>
          </div>

          <nav style={styles.drawerNav}>
            <a href="#features" style={styles.drawerLink} onClick={closeMenu}>
              特徴
            </a>
            <a href="#contents" style={styles.drawerLink} onClick={closeMenu}>
              教材
            </a>
            <a href="#plans" style={styles.drawerLink} onClick={closeMenu}>
              プラン
            </a>
            <div style={styles.drawerDivider} />

            {user ? (
              <>
                <Link href="/mypage" style={styles.drawerLink} onClick={closeMenu}>
                  マイページ
                </Link>

                {/* ✅ 確実修正：保存業種を最優先で select-mode へ */}
                <Button
                  variant="main"
                  onClick={() => {
                    closeMenu()
                    const industry = resolveIndustry()
                    router.push(withIndustry("/select-mode", industry))
                  }}
                >
                  学習を始める
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" style={styles.drawerLink} onClick={closeMenu}>
                  ログイン
                </Link>
                <Button
                  variant="main"
                  onClick={() => {
                    closeMenu()
                    router.push("/login")
                  }}
                >
                  ログインして始める
                </Button>
              </>
            )}
          </nav>
        </aside>
      ) : null}

      <div style={isMobile ? { ...styles.shell, maxWidth: 560, padding: "0 6px" } : styles.shell}>
        <header
          style={
            isMobile
              ? { ...styles.header, flexDirection: "row", alignItems: "center" }
              : styles.header
          }
        >
          <div style={styles.brand}>
            <div style={styles.logo}>📚</div>
            <div>
              <div style={styles.brandName}>学習プラットフォーム</div>
              <div style={styles.brandSub}>分野別・月替わり受講・企業管理にも対応</div>
            </div>
          </div>

          <button type="button" onClick={() => setMenuOpen(true)} style={styles.burgerBtn} aria-label="open menu">
            ☰
          </button>
        </header>

        <section style={isMobile ? { ...styles.hero, gridTemplateColumns: "1fr" } : styles.hero}>
          <div>
            <h1 style={isMobile ? { ...styles.h1, fontSize: 26, lineHeight: 1.15 } : styles.h1}>
              迷わず学べる
              <br />
              “今月の教材” に集中できる学習体験
            </h1>
            <div style={isMobile ? { ...styles.heroStack, marginTop: 14 } : styles.heroStack}>
              <div
                style={
                  isMobile
                    ? { ...styles.speakingHero, padding: 16, borderRadius: 16 }
                    : { ...styles.speakingHero, padding: 20 }
                }
              >
                <div style={styles.gameHeroTop}>
                  <div style={styles.speakingHeroTitle}>🎤 AI日本語スピーキング</div>
                  <div style={styles.speakingHeroSub}>
                    言いたいことを日本語にして、話して、AI評価まで一気に練習できます
                  </div>
                </div>

                <button type="button" onClick={goSpeaking} style={styles.speakingHeroBtn}>
                  会話トレーニングを始める
                </button>

                <div style={styles.gameHeroNote}>※ マイクが必要です。スマホでも練習できます</div>
              </div>

              <div style={isMobile ? { ...styles.gameHero, padding: 14, borderRadius: 16, marginTop: 0 } : styles.gameHero}>
                <div style={styles.gameHeroTop}>
                  <div style={styles.gameHeroTitle}>🎮 日本語バトル</div>
                  <div style={styles.gameHeroSub}>
                    {user ? "今日も腕試し！スコア・レベルが保存されます" : "登録不要でまず体験。ゲストは1日1回プレイOK"}
                  </div>
                </div>

                <button type="button" onClick={goJapaneseBattle} style={styles.gameHeroBtn}>
                  今すぐバトルする
                </button>

                <div style={styles.gameHeroNote}>{user ? "※ ランキングはゲーム内から挑戦できます" : "※ 2回目以降は登録で解放"}</div>
              </div>
            </div>

            <div style={isMobile ? { ...styles.heroActions, flexDirection: "column" } : styles.heroActions}>
              <Button variant="main" onClick={cta}>
                {user ? "学習を始める" : "ログインして始める"}
              </Button>

              {user ? (
                <Button variant="sub" onClick={() => router.push("/mypage")}>
                  マイページを見る
                </Button>
              ) : (
                <Button variant="sub" onClick={() => router.push("/login")}>
                  まずはログイン
                </Button>
              )}
            </div>
          </div>

          <div style={isMobile ? { ...styles.heroCard, padding: 12 } : styles.heroCard}>
            <div style={styles.heroCardTitle}>できること</div>
            <ul style={isMobile ? { ...styles.checkList, fontSize: 14, paddingLeft: 18 } : styles.checkList}>
              <li>✅ 1ヶ月単位で受講教材をえらべる</li>
              <li>✅ 通常 / 模擬 / 復習で習熟アップ</li>
              <li>✅ 学習回数・連続日数・合格率を可視化</li>
              <li>✅ スピーキング・ヒアリングにも対応</li>
            </ul>
          </div>
        </section>

        <section id="features" style={styles.section}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>特徴</h2>
            <div style={styles.sectionSub}>導線を一本化して、迷わない学習に。</div>
          </div>

          <div style={styles.grid3}>
            <div style={styles.featureCard}>
              <div style={styles.featureTitle}>教材選択がブレない</div>
              <div style={styles.featureText}>
                プランに応じて候補を決め、月によって学習内容をかえられる。
              </div>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureTitle}>日本語の勉強が多彩</div>
              <div style={styles.featureText}>
                検定の勉強だけでなく、現場で使える日本語を学べる
              </div>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureTitle}>ひとりじゃない</div>
              <div style={styles.featureText}>
                日本語バトルはユーザー同士競いながら高め合う
              </div>
            </div>
          </div>
        </section>

        <section id="contents" style={styles.contentsWrap}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>業種別で探す（おすすめ）</h2>
            <div style={styles.sectionSub}>
              クリックして開くと、その業種で学べる内容が一覧で見れます。
              <br />
              どの業種を選んでも、日本語N4〜N2と日本語バトルを学習に組み込めます。
            </div>
          </div>

          <div style={styles.industryList}>
            {INDUSTRIES.map((ind) => {
              const isOpen = openIndustryId === ind.id
              const items = getItemsForIndustry(ind)

              return (
                <div key={ind.id} style={styles.industryCard}>
                  <button
                    type="button"
                    style={styles.industryHead}
                    onClick={() => toggleIndustry(ind.id)}
                    aria-expanded={isOpen}
                  >
                    <div style={styles.industryHeadLeft}>
                      <div style={styles.industryIcon}>{ind.icon}</div>
                      <div>
                        <div style={styles.industryTitle}>{ind.title}</div>
                        <div style={styles.industrySub}>{ind.subtitle}</div>
                      </div>
                    </div>
                    <div style={styles.industryChevron}>{isOpen ? "−" : "+"}</div>
                  </button>

                  {isOpen ? (
                    <div style={styles.industryBody}>
                      {ind.groups?.length ? (
                        <div style={styles.industryGroupWrap}>
                          {ind.groups.map((group) => {
                            const groupItems = getItemsForGroup(group.quizIds ?? [])
                            const hasLink = !!group.href
                            const hasItems = groupItems.length > 0 || hasLink
                            if (!hasItems) return null

                            const groupKey = `${ind.id}:${group.id}`
                            const isGroupOpen = !!openGroupIds[groupKey]

                            return (
                              <div key={group.id} style={styles.industryGroupCard}>
                                <button
                                  type="button"
                                  style={styles.industryGroupHead}
                                  onClick={() => toggleGroup(ind.id, group.id)}
                                  aria-expanded={isGroupOpen}
                                >
                                  <div>
                                    <div style={styles.industryGroupTitle}>{group.title}</div>
                                    <div style={styles.industryGroupDesc}>{group.description}</div>
                                  </div>
                                  <div style={styles.industryGroupChevron}>{isGroupOpen ? "−" : "+"}</div>
                                </button>

                                {isGroupOpen ? (
                                  hasLink ? (
                                    <div style={styles.industryGrid}>
                                      <div
                                        style={styles.industryItem}
                                        onClick={() => router.push(group.href!)}
                                        onMouseEnter={(e) => {
                                          ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"
                                          ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 20px rgba(0,0,0,0.06)"
                                        }}
                                        onMouseLeave={(e) => {
                                          ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)"
                                          ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 14px rgba(0,0,0,0.04)"
                                        }}
                                      >
                                        <div style={styles.industryItemTitle}>{group.ctaTitle ?? group.title}</div>
                                        <div style={styles.industryItemDesc}>{group.ctaDescription ?? group.description}</div>
                                        <div style={styles.industryItemMeta}>プレイする →</div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={styles.industryGrid}>
                                      {groupItems.map((q) => (
                                        <div
                                          key={q.id}
                                          style={styles.industryItem}
                                          onClick={() => router.push(`/contents/${q.id}`)}
                                          onMouseEnter={(e) => {
                                            ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"
                                            ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 20px rgba(0,0,0,0.06)"
                                          }}
                                          onMouseLeave={(e) => {
                                            ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)"
                                            ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 14px rgba(0,0,0,0.04)"
                                          }}
                                        >
                                          <div style={styles.industryItemTitle}>{q.title}</div>
                                          {q.description ? (
                                            <div style={styles.industryItemDesc}>{q.description}</div>
                                          ) : (
                                            <div style={styles.industryItemDescMuted}>（説明なし）</div>
                                          )}
                                          <div style={styles.industryItemMeta}>詳しく見る →</div>
                                        </div>
                                      ))}
                                    </div>
                                  )
                                ) : null}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div style={styles.industryGrid}>
                          {items.map((q) => (
                            <div
                              key={q.id}
                              style={styles.industryItem}
                              onClick={() => router.push(`/contents/${q.id}`)}
                              onMouseEnter={(e) => {
                                ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"
                                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 20px rgba(0,0,0,0.06)"
                              }}
                              onMouseLeave={(e) => {
                                ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)"
                                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 14px rgba(0,0,0,0.04)"
                              }}
                            >
                              <div style={styles.industryItemTitle}>{q.title}</div>
                              {q.description ? (
                                <div style={styles.industryItemDesc}>{q.description}</div>
                              ) : (
                                <div style={styles.industryItemDescMuted}>（説明なし）</div>
                              )}
                              <div style={styles.industryItemMeta}>詳しく見る →</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                        <Button
                          variant="main"
                          onClick={() => {
                            saveIndustry(ind.id)
                            router.push(withIndustry("/select-mode", ind.id))
                          }}
                        >
                          {user ? "この業種で学習を始める" : "この業種で始める（ログインへ）"}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>

        <section id="plans" style={styles.section}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>プラン</h2>
            <div style={styles.sectionSub}>教材は月替わりで変更。企業は請求/振込にも対応可能。</div>
          </div>

          <div style={styles.grid3}>
            <div style={styles.planCard}>
              <div style={styles.planTitle}>3教材</div>
              <div style={styles.planText}>毎月3教材を選択</div>
              <div style={styles.planMeta}>まずは無理なく始めたい人向け</div>
            </div>

            <div style={styles.planCard}>
              <div style={styles.planTitle}>5教材</div>
              <div style={styles.planText}>毎月5教材を選択</div>
              <div style={styles.planMeta}>標準的にしっかり学びたい人向け</div>
            </div>

            <div style={styles.planCard}>
              <div style={styles.planTitle}>7教材</div>
              <div style={styles.planText}>毎月7教材を選択</div>
              <div style={styles.planMeta}>幅広く一気に伸ばしたい人向け</div>
            </div>
          </div>

          <div style={styles.centerRow}>
            {user ? (
              <Button
                variant="main"
                onClick={() => {
                  const industry = resolveIndustry()
                  router.push(withIndustry("/plans", industry))
                }}
              >
                プラン管理へ
              </Button>
            ) : (
              <Button variant="main" onClick={() => router.push("/login")}>
                ログインしてプランを見る
              </Button>
            )}
          </div>
        </section>
        {/* ★ 目玉AI会話ブロック */}
<div
  style={{
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    background: "linear-gradient(135deg, #10b981, #0f766e)",
    color: "#fff",
    boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
  }}
>
  <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>
    🚀 今すぐAI会話で実力アップ
  </div>

  <div style={{ fontSize: 13, opacity: 0.95, lineHeight: 1.6 }}>
    単語・問題だけじゃなく、「話せる力」を一気に伸ばす。
    AIがその場で評価・改善ポイントまでフィードバック。
  </div>

  <button
    onClick={goSpeaking}
    style={{
      marginTop: 12,
      width: "100%",
      padding: "14px",
      borderRadius: 14,
      border: "none",
      background: "#fff",
      color: "#0f766e",
      fontWeight: 900,
      fontSize: 16,
      cursor: "pointer",
      boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
    }}
  >
    AI会話を始める
  </button>
</div>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: 18 },
  shell: { maxWidth: 980, margin: "0 auto" },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },

  brand: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "#111827",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
  },
  brandName: { fontWeight: 900, fontSize: 16 },
  brandSub: { opacity: 0.7, fontSize: 12 },

  burgerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 1000,
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "min(320px, 86vw)",
    height: "100vh",
    background: "#fff",
    zIndex: 1001,
    padding: 16,
    boxShadow: "-6px 0 22px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
  },
  drawerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  drawerClose: {
    width: 40,
    height: 40,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 900,
  },
  drawerNav: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    fontSize: 16,
  },
  drawerLink: {
    textDecoration: "none",
    color: "#111",
    fontWeight: 900,
    opacity: 0.88,
    padding: "10px 10px",
    borderRadius: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  drawerDivider: { height: 1, background: "#e5e7eb", margin: "6px 0" },

  hero: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 12,
    alignItems: "stretch",
  },
  h1: { margin: 0, fontSize: 34, letterSpacing: 0.2, lineHeight: 1.1 },
  lead: { marginTop: 10, opacity: 0.85, lineHeight: 1.7, fontSize: 14 },
  heroActions: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  heroStack: { marginTop: 12, display: "grid", gap: 10 },

  gameHero: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
    color: "#fff",
    boxShadow: "0 10px 26px rgba(0,0,0,0.14)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  gameHeroTop: { display: "flex", flexDirection: "column", gap: 4 },
  gameHeroTitle: { fontSize: 20, fontWeight: 900, letterSpacing: 0.2 },
  gameHeroSub: { opacity: 0.92, fontSize: 13, lineHeight: 1.45 },
  gameHeroBtn: {
    marginTop: 10,
    width: "100%",
    padding: "13px 14px",
    borderRadius: 14,
    border: "none",
    background: "#fff",
    color: "#4c1d95",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(0,0,0,0.10)",
  },
  gameHeroNote: { marginTop: 8, opacity: 0.86, fontSize: 12 },
  speakingHero: {
    padding: 16,
    borderRadius: 18,
    background: "linear-gradient(135deg, #10b981, #0f766e)",
    color: "#fff",
    boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  speakingHeroTitle: { fontSize: 22, fontWeight: 900, letterSpacing: 0.2 },
  speakingHeroSub: { opacity: 0.96, fontSize: 14, lineHeight: 1.6 },
  speakingHeroBtn: {
    marginTop: 12,
    width: "100%",
    padding: "14px 14px",
    borderRadius: 14,
    border: "none",
    background: "#fff",
    color: "#0f766e",
    fontWeight: 900,
    fontSize: 17,
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(0,0,0,0.10)",
  },

  heroCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
  heroCardTitle: { fontWeight: 900, marginBottom: 8 },
  checkList: { margin: 0, paddingLeft: 18, lineHeight: 1.8, opacity: 0.9 },

  section: { marginTop: 18 },
  sectionHead: { marginBottom: 10 },
  h2: { margin: 0, fontSize: 20 },
  sectionSub: { marginTop: 6, opacity: 0.75, fontSize: 13, lineHeight: 1.6 },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
    alignItems: "stretch",
  },
  featureCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
  featureTitle: { fontWeight: 900, marginBottom: 6 },
  featureText: { opacity: 0.85, lineHeight: 1.7, fontSize: 13 },

  contentsWrap: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
  },

  industryList: { display: "flex", flexDirection: "column", gap: 10 },

  industryCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },

  industryHead: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    padding: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  industryHeadLeft: { display: "flex", alignItems: "center", gap: 12 },
  industryIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    background: "#111827",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: 20,
    fontWeight: 900,
  },

  industryTitle: { fontWeight: 900, fontSize: 15 },
  industrySub: { opacity: 0.75, fontSize: 12, marginTop: 2, lineHeight: 1.5 },
  industryChevron: { fontSize: 22, fontWeight: 900, opacity: 0.7 },

  industryBody: {
    padding: "0 14px 14px",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
  },

  industryNote: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 14,
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    fontSize: 12.5,
    opacity: 0.88,
    lineHeight: 1.6,
  },

  industryGroupWrap: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  industryGroupCard: {
    background: "#fff",
    border: "1px solid #dbe4ff",
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },
  industryGroupHead: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  industryGroupTitle: { fontWeight: 900, fontSize: 16, color: "#0f172a" },
  industryGroupDesc: { marginTop: 4, opacity: 0.75, fontSize: 12.5, lineHeight: 1.6 },
  industryGroupChevron: { fontSize: 22, fontWeight: 900, opacity: 0.7, flexShrink: 0 },

  industryGrid: {
    marginTop: 10,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    alignItems: "stretch",
  },

  industryItem: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    minHeight: 140,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  industryItemTitle: { fontWeight: 900, fontSize: 15 },
  industryItemDesc: { marginTop: 6, opacity: 0.8, fontSize: 12.5, lineHeight: 1.6, minHeight: 36 },
  industryItemDescMuted: { marginTop: 6, opacity: 0.5, fontSize: 12.5, minHeight: 36 },
  industryItemMeta: { marginTop: "auto", paddingTop: 8, fontSize: 12, fontWeight: 800, opacity: 0.7 },
  planCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
  planTitle: { fontWeight: 900, fontSize: 16 },
  planText: { marginTop: 6, opacity: 0.85, lineHeight: 1.6, fontSize: 13 },
  planMeta: { marginTop: 10, fontSize: 12, opacity: 0.65 },

  centerRow: { marginTop: 12, display: "flex", justifyContent: "center" },
}