'use client'

import { ReactNode } from 'react'

export default function QuizLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-xl font-bold mb-4">{title}</h1>
      {children}
    </div>
  )
}
