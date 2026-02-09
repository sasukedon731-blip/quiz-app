'use client'

import { ButtonHTMLAttributes } from 'react'

type Variant = 'main' | 'sub' | 'accent' | 'success' | 'choice'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  isCorrect?: boolean
  isWrong?: boolean
}

export default function Button({
  variant = 'main',
  isCorrect,
  isWrong,
  className = '',
  children,
  ...props
}: Props) {
  let classes = 'button '

  if (variant === 'main') classes += 'button-main '
  if (variant === 'sub') classes += 'button-sub '
  if (variant === 'accent') classes += 'button-accent '
  if (variant === 'success') classes += 'button-success '
  if (variant === 'choice') {
    classes += 'button-choice '
    if (isCorrect) classes += 'correct '
    if (isWrong) classes += 'wrong '
  }

  classes += className

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
