import { Suspense } from "react"
import GameClient from "./GameClient"
import styles from "./page.module.css"

export default function GamePage() {
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