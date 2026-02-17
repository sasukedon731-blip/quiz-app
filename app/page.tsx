"use client"

import { useState } from "react"
import Link from "next/link"

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main style={styles.page}>
      {/* ===== Header ===== */}
      <header style={styles.header}>
        <div style={styles.logo}>📚 学習プラットフォーム</div>

        <button onClick={() => setMenuOpen(true)} style={styles.menuButton}>
          ☰
        </button>
      </header>

      {/* ===== Hamburger Menu ===== */}
      {menuOpen && (
        <>
          <div style={styles.overlay} onClick={() => setMenuOpen(false)} />

          <div style={styles.drawer}>
            <button onClick={() => setMenuOpen(false)} style={styles.closeButton}>
              ✕
            </button>

            <nav style={styles.nav}>
              {/* ✅ “学習導線”をメニューにも入れる */}
              <Link href="/select-mode" onClick={() => setMenuOpen(false)} style={styles.navLink}>
                学習を始める
              </Link>
              <Link href="/select-quizzes" onClick={() => setMenuOpen(false)} style={styles.navLink}>
                教材を選ぶ
              </Link>
              <Link href="/plans" onClick={() => setMenuOpen(false)} style={styles.navLink}>
                プラン
              </Link>
              <Link href="/mypage" onClick={() => setMenuOpen(false)} style={styles.navLink}>
                マイページ
              </Link>

              <div style={styles.navDivider} />

              {/* LP系（必要なら） */}
              <a href="#features" onClick={() => setMenuOpen(false)} style={styles.navLink}>
                特徴
              </a>
              <a href="#flow" onClick={() => setMenuOpen(false)} style={styles.navLink}>
                流れ
              </a>
            </nav>
          </div>
        </>
      )}

      {/* ===== Hero ===== */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          迷わず学べる
          <br />
          “今月の教材”に集中できる学習体験
        </h1>

        <p style={styles.subtitle}>
          教材を選んで、通常・模擬・復習・ゲームを回すだけ。
        </p>

        <div style={styles.buttonGroup}>
          <Link href="/select-mode" style={styles.primaryBtn}>
            学習を始める
          </Link>
          <Link href="/select-quizzes" style={styles.secondaryBtn}>
            教材を選ぶ
          </Link>
        </div>
      </section>

      {/* ===== ✅ 学習できるもの（復活） ===== */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>学習できること</h2>

        <div style={styles.cardGrid}>
          <div style={styles.actionCard}>
            <div style={styles.actionTitle}>🎯 教材を選ぶ</div>
            <div style={styles.actionDesc}>今月学ぶ教材を選択（プランに応じて制限）。</div>
            <Link href="/select-quizzes" style={styles.actionBtn}>
              教材選択へ
            </Link>
          </div>

          <div style={styles.actionCard}>
            <div style={styles.actionTitle}>📘 通常 / 模擬 / 復習</div>
            <div style={styles.actionDesc}>教材ごとに学習モードを選んで進める。</div>
            <Link href="/select-mode" style={styles.actionBtn}>
              学習画面へ
            </Link>
          </div>

          <div style={styles.actionCard}>
            <div style={styles.actionTitle}>🎮 ゲームで学ぶ</div>
            <div style={styles.actionDesc}>日本語検定（N4）固定のゲームでテンポ学習。</div>
            <Link href="/game?mode=normal" style={styles.actionBtn}>
              ゲームへ
            </Link>
          </div>

          <div style={styles.actionCard}>
            <div style={styles.actionTitle}>📈 学習の見える化</div>
            <div style={styles.actionDesc}>学習回数・連続日数・結果をチェック。</div>
            <Link href="/mypage" style={styles.actionBtn}>
              マイページへ
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" style={styles.card}>
        <h2 style={styles.sectionTitle}>特徴</h2>
        <ul style={styles.featureList}>
          <li>✅ 1ヶ月単位で受講教材をえらべる</li>
          <li>✅ 通常 / 模擬 / 復習で習熟アップ</li>
          <li>✅ 学習回数・連続日数・合格率を可視化</li>
          <li>✅ スピーキング・ヒアリングにも対応</li>
        </ul>
      </section>

      {/* ===== Flow (optional) ===== */}
      <section id="flow" style={styles.card}>
        <h2 style={styles.sectionTitle}>流れ</h2>
        <ol style={styles.flowList}>
          <li>1. 教材を選ぶ</li>
          <li>2. 通常 / 模擬 / 復習で学ぶ</li>
          <li>3. ゲームでテンポ学習</li>
          <li>4. マイページで進捗確認</li>
        </ol>
      </section>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: 16,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  logo: { fontWeight: 900, fontSize: 18 },

  menuButton: { fontSize: 24, background: "none", border: "none" },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 998,
  },

  // ✅ ここが「無駄に広い」問題の解決
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "min(320px, 86vw)", // ← ここ！
    height: "100vh",
    background: "#fff",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.12)",
    padding: 18,
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
  },

  closeButton: {
    fontSize: 22,
    background: "none",
    border: "none",
    alignSelf: "flex-end",
    marginBottom: 14,
  },

  nav: { display: "flex", flexDirection: "column", gap: 14, fontSize: 16, fontWeight: 800 },

  navLink: { textDecoration: "none", color: "#111827" },

  navDivider: { height: 1, background: "#e5e7eb", margin: "8px 0" },

  hero: { marginTop: 8 },

  title: { fontSize: 22, fontWeight: 900, lineHeight: 1.35, margin: 0 },

  subtitle: { marginTop: 10, fontSize: 14, opacity: 0.8 },

  buttonGroup: { marginTop: 14, display: "flex", flexDirection: "column", gap: 10 },

  primaryBtn: {
    padding: "14px",
    borderRadius: 16,
    background: "#2563eb",
    color: "#fff",
    textAlign: "center",
    fontWeight: 900,
    textDecoration: "none",
  },

  secondaryBtn: {
    padding: "14px",
    borderRadius: 16,
    background: "#111827",
    color: "#fff",
    textAlign: "center",
    fontWeight: 900,
    textDecoration: "none",
  },

  card: { marginTop: 18, background: "#fff", borderRadius: 16, padding: 18 },

  sectionTitle: { fontSize: 18, fontWeight: 900, margin: "0 0 12px" },

  // ✅ 学習導線を“見える化”するカード群
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },

  actionCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    background: "#fafafa",
  },

  actionTitle: { fontWeight: 900, marginBottom: 6 },

  actionDesc: { fontSize: 13, opacity: 0.8, lineHeight: 1.45 },

  actionBtn: {
    display: "block",
    marginTop: 10,
    padding: "12px",
    borderRadius: 14,
    background: "#2563eb",
    color: "#fff",
    textAlign: "center",
    fontWeight: 900,
    textDecoration: "none",
  },

  featureList: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10, fontSize: 14 },

  flowList: { margin: 0, paddingLeft: 18, display: "grid", gap: 8, fontSize: 14 },
}
