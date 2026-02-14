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

  // ✅ STEP1：上位6件だけ表示
  const quizzes = useMemo(() => {
    return quizCatalog
      .filter((q) => q.enabled)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .slice(0, 6) // ← ここが追加
      .map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description ?? "",
      }))
  }, [])

  const cta = () => {
    if (loading) return
    if (user) router.push("/select-mode")
    else router.push("/login")
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.logo}>📚</div>
            <div>
              <div style={styles.brandName}>学習プラットフォーム</div>
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
              迷わず学べる<br />
              “今月の教材” に集中できる学習体験
            </h1>
            <p style={styles.lead}>
              プランに応じて教材を選び、通常・模擬・復習を回すだけ。
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
          </div>

          <div style={styles.heroCard}>
            <div style={styles.heroCardTitle}>できること</div>
            <ul style={styles.checkList}>
              <li>✅ 1ヶ月単位で受講教材をえらべる</li>
              <li>✅ 通常 / 模擬 / 復習で習熟アップ</li>
              <li>✅ 学習回数・連続日数・合格率を可視化</li>
              <li>✅ スピーキング・ヒアリングにも対応</li>
            </ul>
          </div>
        </section>

        {/* 教材紹介 */}
        <section id="contents" style={styles.contentsWrap}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>教材（紹介）</h2>
            <div style={styles.sectionSub}>
              ※ TOPは紹介のみ。学習開始は「学習を始める」から。
            </div>
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

          {/* ✅ STEP2：一覧ページへの導線追加 */}
          <div style={{ marginTop: 14, textAlign: "center" }}>
            <Button variant="sub" onClick={() => router.push("/contents")}>
              すべての教材を見る
            </Button>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" style={styles.section}>
          <div style={styles.sectionHead}>
            <h2 style={styles.h2}>学習の流れ</h2>
          </div>

          <ol style={styles.flow}>
            <li><b>ログイン</b></li>
            <li><b>教材選択</b></li>
            <li><b>学習</b></li>
            <li><b>可視化</b></li>
          </ol>

          <div style={styles.centerRow}>
            <Button variant="main" onClick={cta}>
              {user ? "学習を始める" : "ログインして始める"}
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: 18 },
  shell: { maxWidth: 980, margin: "0 auto" },

  header: {
    display: "flex",
    justifyContent: "space-between",
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

  nav: { display: "flex", gap: 10, alignItems: "center" },
  navLink: { textDecoration: "none", color: "#111", fontWeight: 800 },

  hero: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 12,
  },

  h1: { fontSize: 34, margin: 0 },
  lead: { marginTop: 10, opacity: 0.85 },

  heroActions: { marginTop: 12, display: "flex", gap: 10 },

  heroCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
  },

  heroCardTitle: { fontWeight: 900, marginBottom: 8 },
  checkList: { margin: 0, paddingLeft: 18 },

  section: { marginTop: 18 },
  sectionHead: { marginBottom: 10 },
  h2: { margin: 0, fontSize: 20 },

  contentsWrap: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
  },

  quizCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    minHeight: 130,
  },

  quizTitle: { fontWeight: 900, fontSize: 15 },
  quizDesc: { marginTop: 6, minHeight: 34, fontSize: 12.5 },
  quizDescMuted: { marginTop: 6, minHeight: 34, fontSize: 12.5 },
  quizMeta: { marginTop: "auto", fontSize: 11.5, opacity: 0.6 },

  flow: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
  },

  centerRow: { marginTop: 12, display: "flex", justifyContent: "center" },
}
