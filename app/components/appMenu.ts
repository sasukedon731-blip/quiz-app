export type AppMenuItem = {
  href: string
  label: string
  icon: string
}

/**
 * ✅ アプリ全体のハンバーガーメニュー定義（ここだけを編集すれば全ページ統一）
 *
 * NOTE:
 * - /select-mode は industry を持っているとより良いが、無くても動く前提で固定リンクにしている。
 * - industry を付けたいページは、呼び出し側で href を加工して渡してもOK。
 */
export const APP_MENU: AppMenuItem[] = [
  { href: "/", icon: "🏠", label: "TOPへ" },
  { href: "/mypage", icon: "👤", label: "マイページ" },
  { href: "/select-mode", icon: "🎮", label: "学習を始める" },
  { href: "/plans", icon: "💳", label: "プラン" },
  { href: "/contents", icon: "📚", label: "教材一覧" },
]
