// app/(auth)/game/page.tsx
import { Suspense } from "react"
import GameClient from "./GameClient"

export default function GamePage() {
  return (
    <div className="gamePageOuter">
      <div className="gamePageInner">
        <Suspense fallback={null}>
          <GameClient />
        </Suspense>
      </div>

      <style jsx global>{`
        .gamePageOuter {
          width: 100%;
          display: flex;
          justify-content: center; /* ← 左寄りを強制的に中央へ */
        }
        .gamePageInner {
          width: 100%;
          max-width: 520px; /* ←スマホは今のままの幅感 */
          padding: 16px;
        }
        @media (min-width: 1024px) {
          .gamePageInner {
            max-width: 1100px; /* ←PCだけ広げる */
            padding: 24px;
          }
        }
      `}</style>
    </div>
  )
}