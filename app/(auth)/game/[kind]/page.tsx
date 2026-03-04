import { Suspense } from "react"
import AppHeader from "@/app/components/AppHeader"
import styles from "../page.module.css"
import GameKindClient from "../ui/GameKindClient"

export default function GameKindPage({ params }: { params: { kind: string } }) {
  return (
    <div className={styles.gamePageOuter}>
      <div className={styles.gamePageInner}>
        <AppHeader title="ゲーム" />
        <Suspense fallback={null}>
          <GameKindClient key={params.kind} kind={params.kind} />
        </Suspense>
      </div>
    </div>
  )
}
