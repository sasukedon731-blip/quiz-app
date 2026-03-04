import { Suspense } from "react"
import styles from "../page.module.css"
import GameClient from "../GameClient"

export default function GamePlayPage() {
  return (
    <div className={styles.gamePageOuter}>
      <div className={styles.gamePageInner}>
        <Suspense fallback={null}>
          <GameClient />
        </Suspense>
      </div>
    </div>
  )
}
