import { Suspense } from 'react'
import SelectModeClient from './SelectModeClient'

export const dynamic = 'force-dynamic'

export default function SelectModePage() {
  return (
    <Suspense fallback={null}>
      <SelectModeClient />
    </Suspense>
  )
}
