"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Button from "@/app/components/Button"
import { useAuth } from "@/app/lib/useAuth"
import { quizCatalog } from "@/app/data/quizCatalog"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const quizzes = useMemo(() => {
    return quizCatalog
      .filter((q) => q.enabled)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description ?? "",
      }))
  }, [])

  const cta = () => {
    if (loading) return
    if (user) router.push("/select-mode")
    else router.push("/login") // ←ルート違うならここだけ直す
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.logo}>📚</div>
            <div>
              <div style={styles.brandName}>学習クイズプラットフォーム</div>
              <div style={styles.brandSub}>分野別・月替わり受講・企業管理にも対応</div>
            </div>
          </div>

          <nav style={styles.nav}>
            <a href="#features" style={styles.navLink}>特徴</a>
            <a href="#contents" style={styles.navLink}>教材</a>
            <a href="#plans" style={styles.navLink}>プラン</a>
            <a href="#flow" style={styles.navLink}>流れ</a>
            {user ? (
              <>
                <Link href="/mypage" style={styles.navLink}>マイページ</Link>
                <Button variant="main" onClick={() => router.push("/select-mode")}>
                  学習を始める
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" style={styles.navLink}>ログイン</Link>
                <Button variant="main" onClick={cta}>
                  ログインして始める
                </Button>
              </>
            )}
          </nav>
        </header>

        {/* Hero */}
        <section style={styles.hero}>
          <div>
            <h1 style={styles.h1}>
              迷わず学べる。<br />
              “今月の教材” に集中できる学習体験。
            </h1>
            <p style={styles.lead}>
              プランに応じて教材を選び、通常・模擬・復習を回すだけ。
              個人はカード決済、企業は請求/振込にも対応できます（設計上）。
            </p>

            <div style={styles.heroActions}>
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

            <div style={styles.heroNote}>
              ※ TOPでは学習開始ボタンを教材ごとに置かず、導線を <b>select-mode</b> に一本化しています。
            </div>
          </div>

          <div style={styles.heroCard}>
            <div style={styles.heroCardTitle}>できること</div>
            <ul style={styles.checkList}>
              <li>✅ 今月の受講教材を選んでロック（1ヶ月単位）</li>
              <li>✅ 通常 / 模擬 / 復習で回せる</li>
              <li>✅ 学習回数・連続日数・合格率を可視化</li>
              <li>✅ 将来：スピーキング・画像問題など拡張OK</li>
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
                マイページは “進行中” と “履歴あり” のみ表示。
                教材が10以上になっても見にくくなりません。
              </div>
            </div>
          </div>
        </section>

        {/* Contents (No study buttons here) */}
        <section id="contents" style={styles.section}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>教材（紹介）</h2>
            <div style={styles.sectionSub}>※ TOPは紹介のみ。学習開始は「学習を始める」から。</div>
          </div>

          <div style={styles.grid}>
            {quizzes.map((q) => (
              <div key={q.id} style={styles.quizCard}>
                <div style={styles.quizTitle}>{q.title}</div>
                {q.description ? (
                  <div style={styles.quizDesc}>{q.description}</div>
                ) : (
                  <div style={styles.quizDescMuted}>（説明なし）</div>
                )}
                <div style={styles.quizMeta}>ID: {q.id}</div>
              </div>
            ))}
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
            <li><b>ログイン</b>（公式LINE入口はここに接続予定）</li>
            <li><b>教材選択</b>（今月の受講を確定 → 1ヶ月ロック）</li>
            <li><b>学習</b>（通常 / 模擬 / 復習）</li>
            <li><b>可視化</b>（進捗・合格率・履歴）</li>
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
              <a href="#features" style={styles.footerLink}>特徴</a>
              <a href="#contents" style={styles.footerLink}>教材</a>
              <a href="#plans" style={styles.footerLink}>プラン</a>
              <a href="#flow" style={styles.footerLink}>流れ</a>
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

  nav: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  navLink: { textDecoration: "none", color: "#111", fontWeight: 800, opacity: 0.85 },

  hero: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 12,
    alignItems: "stretch",
  },
  h1: { margin: 0, fontSize: 34, letterSpacing: 0.2, lineHeight: 1.1 },
  lead: { marginTop: 10, opacity: 0.85, lineHeight: 1.7, fontSize: 14 },
  heroActions: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  heroNote: { marginTop: 10, fontSize: 12, opacity: 0.7, lineHeight: 1.6 },

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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
    alignItems: "stretch",
  },
  quizCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 170,
  },
  quizTitle: { fontWeight: 900, fontSize: 16 },
  quizDesc: { marginTop: 8, opacity: 0.85, lineHeight: 1.6, minHeight: 44, fontSize: 13 },
  quizDescMuted: { marginTop: 8, opacity: 0.55, minHeight: 44, fontSize: 13 },
  quizMeta: { marginTop: "auto", paddingTop: 10, fontSize: 12, opacity: 0.6 },

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
