import { Suspense } from "react"
import AppHeader from "@/app/components/AppHeader"
import styles from "../page.module.css"
import GameKindClient from "../ui/GameKindClient"

export default function GameKindPage({ params }: { params: { kind: string } }) {
  return (
    <div className={styles.gamePageOuter}>
      <div className={styles.gamePageInner}>
        <AppHeader title="ゲーム" />

        {/* DEBUG: ここが undefined ならルーティングがおかしい */}
        <div
          style={{
            position: "fixed",
            top: 8,
            left: 8,
            zIndex: 99999,
            padding: "6px 10px",
            background: "#000",
            color: "#fff",
            fontSize: 12,
            borderRadius: 8,
            lineHeight: 1.3,
          }}
        >
          BUILD_TAG=GK_20260305A
          <br />
          params.kind={String(params?.kind)}
        </div>

        <Suspense fallback={null}>
          <GameKindClient key={params.kind} kind={params.kind} />
        </Suspense>
      </div>
    </div>
  )
}