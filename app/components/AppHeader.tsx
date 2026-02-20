"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"

import Button from "@/app/components/Button"
import { auth } from "@/app/lib/firebase"
import { useAuth } from "@/app/lib/useAuth"

type Props = {
  /** ページ上部に表示する小さめのタイトル（任意） */
  title?: string
}

export default function AppHeader({ title }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  const [open, setOpen] = useState(false)

  const isTop = pathname === "/"

  const items = useMemo(() => {
    return [
      { label: "TOPへ", href: "/" },
      { label: "マイページ", href: "/mypage" },
      { label: "学習を始める", href: "/select-mode" },
      { label: "教材選択", href: "/select-quizzes" },
      { label: "プラン", href: "/plans" },
    ]
  }, [])

  const close = () => setOpen(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } finally {
      router.push("/")
    }
  }

  return (
    <>
      <header className="appHeader" aria-label="header">
        <div className="appHeaderLeft">
          <Link href="/" className="appHeaderBrand" aria-label="TOPへ">
            <span className="appHeaderLogo">📚</span>
            <span className="appHeaderName">学習プラットフォーム</span>
          </Link>
          {title ? <span className="appHeaderTitle">{title}</span> : null}
        </div>

        {!isTop ? (
          <button
            className="hamburgerBtn"
            aria-label="メニュー"
            onClick={() => setOpen(true)}
            type="button"
          >
            ☰
          </button>
        ) : null}
      </header>

      {open ? (
        <div className="drawerOverlay" onClick={close} role="dialog" aria-label="menu">
          <div className="drawerPanel" onClick={(e) => e.stopPropagation()}>
            <div className="drawerHead">
              <div style={{ fontWeight: 900 }}>メニュー</div>
              <button className="drawerClose" aria-label="閉じる" onClick={close} type="button">
                ✕
              </button>
            </div>

            <div className="drawerBody">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className="drawerLink"
                  onClick={close}
                >
                  {it.label}
                </Link>
              ))}

              <div className="drawerDivider" />

              {user ? (
                <Button
                  variant="danger"
                  onClick={async () => {
                    close()
                    await handleLogout()
                  }}
                >
                  ログアウト
                </Button>
              ) : (
                <Button
                  variant="main"
                  onClick={() => {
                    close()
                    router.push("/login")
                  }}
                >
                  ログイン
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
