"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Button from "@/app/components/Button"
import { useAuth } from "@/app/lib/useAuth"
import { quizCatalog } from "@/app/data/quizCatalog"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // ✅ Mobile判定（LPをスマホで読みやすく）
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

  // ✅ 上位6件だけ表示（LPを長くしない）
  const quizzes = useMemo(() => {
    return quizCatalog
      .filter((q) => q.enabled)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .slice(0, 6)
      .map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description ?? "",
      }))
  }, [])

  const cta = () => {
    if (loading) return
    if (user) router.push("/select-mode")
    else router.push("/login") // ルート違うならここだけ修正
  }

  // ✅ TOPからゲームへ（ゲストでもOK）
  const goJapaneseBattle = () => {
    // normal = カジュアル（ゲスト1日1回） / attack = ランキング（ログイン推奨）
    router.push("/game?mode=normal")
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <main style={styles.page}>
      {/* ✅ オーバーレイ（メニュー開いてる時） */}
      {menuOpen ? <div style={styles.overlay} onClick={closeMenu} /> : null}

      {/* ✅ ドロワー（幅は広すぎないように固定） */}
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
            <a href="#flow" style={styles.drawerLink} onClick={closeMenu}>
              流れ
            </a>

            <div style={styles.drawerDivider} />

            {user ? (
              <>
                <Link href="/mypage" style={styles.drawerLink} onClick={closeMenu}>
                  マイページ
                </Link>
                <Button
                  variant="main"
                  onClick={() => {
                    closeMenu()
                    router.push("/select-mode")
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
                    cta()
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
        {/* Header（LPはヘッダーに学習導線を置かない：ハンバーガーに集約） */}
        <header style={isMobile ? { ...styles.header, flexDirection: "row", alignItems: "center" } : styles.header}>
          <div style={styles.brand}>
            <div style={styles.logo}>📚</div>
            <div>
              <div style={styles.brandName}>学習プラットフォーム</div>
              <div style={styles.brandSub}>分野別・月替わり受講・企業管理にも対応</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            style={styles.burgerBtn}
            aria-label="open menu"
          >
            ☰
          </button>
        </header>

        {/* Hero */}
        <section style={isMobile ? { ...styles.hero, gridTemplateColumns: "1fr" } : styles.hero}>
          <div>
            <h1 style={isMobile ? { ...styles.h1, fontSize: 26, lineHeight: 1.15 } : styles.h1}>
              迷わず学べる
              <br />
              “今月の教材” に集中できる学習体験
            </h1>
            <p style={isMobile ? { ...styles.lead, fontSize: 15 } : styles.lead}>
              プランに応じて教材を選び、通常・模擬・復習を回すだけ。
            </p>

            {/* 🎮 Game Hero（TOPでもゲームを主役に） */}
            <div style={isMobile ? { ...styles.gameHero, padding: 14, borderRadius: 16 } : styles.gameHero}>
              <div style={styles.gameHeroTop}>
                <div style={styles.gameHeroBadge}>🔥 今月のおすすめ</div>
                <div style={styles.gameHeroTitle}>🎮 日本語バトル</div>
                <div style={styles.gameHeroSub}>
                  {user ? "今日も腕試し！スコア・レベルが保存されます" : "登録不要でまず体験。ゲストは1日1回プレイOK"}
                </div>
              </div>

              <button type="button" onClick={goJapaneseBattle} style={styles.gameHeroBtn}>
                今すぐバトルする
              </button>

              <div style={styles.gameHeroNote}>
                {user ? "※ ランキングはゲーム内から挑戦できます" : "※ 2回目以降は登録で解放"}
              </div>
            </div>

            {/* ✅ LPとしてのCTAは残す（学習導線はメニューにもある） */}
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

        {/* Features */}
        <section id="features" style={styles.section}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>特徴</h2>
            <div style={styles.sectionSub}>導線を一本化して、迷わない学習に。</div>
          </div>

          <div style={styles.grid3}>
            <div style={styles.featureCard}>
              <div style={styles.featureTitle}>教材選択がブレない</div>
              <div style={styles.featureText}>
                プランに応じて候補を決め、今月の教材は <b>selectedQuizTypes</b> に集約。
                画面ごとの二重管理を排除します。
              </div>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureTitle}>モードが整理される</div>
              <div style={styles.featureText}>
                select-mode を「ハブ」にして、通常/模擬/復習の入口を統一。
                直リンク事故もガードできます。
              </div>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureTitle}>増えても見やすい</div>
              <div style={styles.featureText}>
                教材が増えても、TOPは「紹介」だけ。
                学習開始の導線は <b>学習を始める</b> に一本化します。
              </div>
            </div>
          </div>
        </section>

        {/* Contents (No study buttons here) */}
        <section id="contents" style={styles.contentsWrap}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>教材（紹介）</h2>
            <div style={styles.sectionSub}>※ TOPは紹介のみ。教材カードをクリックすると詳細ページへ。</div>
          </div>

          {/* ✅ 6件だけ表示 / ✅ クリックで詳細へ */}
          <div style={styles.grid}>
            {quizzes.map((q) => (
              <div
                key={q.id}
                style={styles.quizCard}
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
                <div style={styles.quizTitle}>{q.title}</div>

                {q.description ? (
                  <div style={styles.quizDesc}>{q.description}</div>
                ) : (
                  <div style={styles.quizDescMuted}>（説明なし）</div>
                )}

                <div style={styles.quizMeta}>詳しく見る →</div>
              </div>
            ))}
          </div>

          {/* ✅ 一覧ページへの導線 */}
          <div style={{ marginTop: 14, textAlign: "center" }}>
            <Button variant="sub" onClick={() => router.push("/contents")}>
              すべての教材を見る
            </Button>
          </div>
        </section>

        {/* Plans */}
        <section id="plans" style={styles.section}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>プラン</h2>
            <div style={styles.sectionSub}>教材は月替わりで変更。企業は請求/振込にも対応可能。</div>
          </div>

          <div style={styles.grid4}>
            <div style={styles.planCard}>
              <div style={styles.planTitle}>trial</div>
              <div style={styles.planText}>お試し（教材固定1つ）</div>
              <div style={styles.planMeta}>まず体験したい人向け</div>
            </div>

            <div style={styles.planCard}>
              <div style={styles.planTitle}>3教材</div>
              <div style={styles.planText}>毎月3教材を選択</div>
              <div style={styles.planMeta}>個人学習の主力</div>
            </div>

            <div style={styles.planCard}>
              <div style={styles.planTitle}>5教材</div>
              <div style={styles.planText}>毎月5教材を選択</div>
              <div style={styles.planMeta}>短期で伸ばしたい人</div>
            </div>

            <div style={styles.planCard}>
              <div style={styles.planTitle}>ALL</div>
              <div style={styles.planText}>全教材を利用</div>
              <div style={styles.planMeta}>企業研修・管理に最適</div>
            </div>
          </div>

          <div style={styles.centerRow}>
            {user ? (
              <Button variant="main" onClick={() => router.push("/plans")}>
                プラン管理へ
              </Button>
            ) : (
              <Button variant="main" onClick={() => router.push("/login")}>
                ログインしてプランを見る
              </Button>
            )}
          </div>
        </section>

        {/* Flow */}
        <section id="flow" style={styles.section}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>学習の流れ</h2>
            <div style={styles.sectionSub}>迷わない導線で、学習だけに集中。</div>
          </div>

          <ol style={styles.flow}>
            <li>
              <b>ログイン</b>（公式LINE入口はここに接続予定）
            </li>
            <li>
              <b>教材選択</b>（今月の受講を確定 → 1ヶ月ロック）
            </li>
            <li>
              <b>学習</b>（通常 / 模擬 / 復習）
            </li>
            <li>
              <b>可視化</b>（進捗・合格率・履歴）
            </li>
          </ol>

          <div style={styles.centerRow}>
            <Button variant="main" onClick={cta}>
              {user ? "学習を始める" : "ログインして始める"}
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            <div style={{ fontWeight: 900 }}>学習クイズプラットフォーム</div>
            <div style={{ opacity: 0.7, marginTop: 6, lineHeight: 1.6 }}>
              教材追加・分野分け・出題形式拡張（スピーキング/画像）など、成長前提で設計しています。
            </div>
            <div style={styles.footerLinks}>
              <a href="#features" style={styles.footerLink}>
                特徴
              </a>
              <a href="#contents" style={styles.footerLink}>
                教材
              </a>
              <a href="#plans" style={styles.footerLink}>
                プラン
              </a>
              <a href="#flow" style={styles.footerLink}>
                流れ
              </a>
            </div>
          </div>
        </footer>
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

  // ✅ ハンバーガー（ヘッダー右上）
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

  // ✅ オーバーレイ & ドロワー（広すぎない）
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

  // ✅ Game Hero（TOPでゲームを目立たせる）
  gameHero: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
    color: "#fff",
    boxShadow: "0 10px 26px rgba(0,0,0,0.14)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  gameHeroTop: { display: "flex", flexDirection: "column", gap: 6 },
  gameHeroBadge: {
    display: "inline-flex",
    alignSelf: "flex-start",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.2,
  },
  gameHeroTitle: { fontSize: 18, fontWeight: 900, letterSpacing: 0.2 },
  gameHeroSub: { opacity: 0.92, fontSize: 13, lineHeight: 1.5 },
  gameHeroBtn: {
    marginTop: 12,
    width: "100%",
    padding: "14px 14px",
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

  // ✅ 教材紹介の見た目を少し変える（セクション感）
  contentsWrap: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
  },

  // ✅ 教材カードは小さめ・詰める
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    alignItems: "stretch",
  },
  quizCard: {
    background: "#f9fafb",
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
  quizTitle: { fontWeight: 900, fontSize: 15 },
  quizDesc: { marginTop: 6, opacity: 0.8, fontSize: 12.5, lineHeight: 1.6, minHeight: 36 },
  quizDescMuted: { marginTop: 6, opacity: 0.5, fontSize: 12.5, minHeight: 36 },
  quizMeta: { marginTop: "auto", paddingTop: 8, fontSize: 12, fontWeight: 800, opacity: 0.7 },

  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
    alignItems: "stretch",
  },
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

  flow: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
    lineHeight: 1.9,
    margin: 0,
    paddingLeft: 22,
  },

  centerRow: { marginTop: 12, display: "flex", justifyContent: "center" },

  footer: { marginTop: 18, paddingTop: 12, borderTop: "1px solid #e5e7eb" },
  footerInner: { padding: 4 },
  footerLinks: { marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" },
  footerLink: { textDecoration: "none", color: "#111", opacity: 0.75, fontWeight: 800 },
}
