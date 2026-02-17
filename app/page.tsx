"use client"

import { useState } from "react"
import Link from "next/link"

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main style={styles.page}>
      {/* ===== Header ===== */}
      <header style={styles.header}>
        <div style={styles.logo}>
          📚 学習プラットフォーム
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          style={styles.menuButton}
        >
          ☰
        </button>
      </header>

      {/* ===== Hamburger Menu ===== */}
      {menuOpen && (
        <>
          {/* 背景暗転 */}
          <div
            style={styles.overlay}
            onClick={() => setMenuOpen(false)}
          />

          {/* メニュー本体 */}
          <div style={styles.drawer}>
            <button
              onClick={() => setMenuOpen(false)}
              style={styles.closeButton}
            >
              ✕
            </button>

            <nav style={styles.nav}>
              <a href="#features">特徴</a>
              <a href="#materials">教材</a>
              <a href="#plans">プラン</a>
              <a href="#flow">流れ</a>
              <Link href="/mypage">マイページ</Link>
            </nav>
          </div>
        </>
      )}

      {/* ===== Hero ===== */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          迷わず学べる<br />
          “今月の教材”に集中できる学習体験
        </h1>

        <p style={styles.subtitle}>
          プランに応じて教材を選び、通常・模擬・復習を回すだけ。
        </p>

        <div style={styles.buttonGroup}>
          <Link href="/select-mode" style={styles.primaryBtn}>
            学習を始める
          </Link>

          <Link href="/mypage" style={styles.secondaryBtn}>
            マイページを見る
          </Link>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" style={styles.card}>
        <h2 style={styles.sectionTitle}>できること</h2>

        <ul style={styles.featureList}>
          <li>✅ 1ヶ月単位で教材をえらべる</li>
          <li>✅ 通常 / 模擬 / 復習で習熟アップ</li>
          <li>✅ 学習回数・連続日数を可視化</li>
          <li>✅ スピーキング・ヒアリング対応</li>
        </ul>
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
    marginBottom: 20,
  },

  logo: {
    fontWeight: 900,
    fontSize: 18,
  },

  menuButton: {
    fontSize: 24,
    background: "none",
    border: "none",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    zIndex: 998,
  },

  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "75%",
    height: "100vh",
    background: "#fff",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
    padding: 24,
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
  },

  closeButton: {
    fontSize: 22,
    background: "none",
    border: "none",
    alignSelf: "flex-end",
    marginBottom: 30,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    fontSize: 16,
    fontWeight: 700,
  },

  hero: {
    marginTop: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1.4,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.8,
  },

  buttonGroup: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

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
    background: "#e5e7eb",
    color: "#111827",
    textAlign: "center",
    fontWeight: 900,
    textDecoration: "none",
  },

  card: {
    marginTop: 30,
    background: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 12,
  },

  featureList: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    fontSize: 14,
  },
}
