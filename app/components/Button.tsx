"use client"

import React from "react"

type Variant = "main" | "accent" | "choice" | "success"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  isCorrect?: boolean
  isWrong?: boolean
}

export default function Button({
  children,
  variant = "main",
  isCorrect,
  isWrong,
  className = "",
  ...props
}: Props) {
  const classes = ["btn"] as string[]

  // variant
  if (variant === "main") classes.push("btnPrimary")
  if (variant === "accent") classes.push("btnAccent")
  if (variant === "success") classes.push("btnSuccess")

  // choice（選択肢）
  if (variant === "choice") {
    classes.push("choice")
    if (isCorrect) classes.push("choiceCorrect")
    if (isWrong) classes.push("choiceWrong")
  }

  if (className) classes.push(className)

  return (
    <button {...props} className={classes.join(" ")}>
      {children}
    </button>
  )
}
