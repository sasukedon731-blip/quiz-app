import { Suspense } from "react"
import styles from "../page.module.css"
import GameKindClient from "../ui/GameKindClient"

export default function GameKindPage({ params }: { params: { kind: string } }) {
  return (
    <div className={styles.gamePageOuter}>
      <div className={styles.gamePageInner}>
        <Suspense fallback={null}>
          <GameKindClient kind={params.kind} />
        </Suspense>
      </div>
    </div>
  )
}
