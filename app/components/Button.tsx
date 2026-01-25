"use client";

import React, { ButtonHTMLAttributes } from "react";

type Variant = "main" | "accent" | "success" | "choice";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isCorrect?: boolean;
  isWrong?: boolean;
}

export default function Button({
  variant = "main",
  isCorrect,
  isWrong,
  children,
  ...props
}: Props) {
  let className = "button ";

  if (variant === "main") className += "button-main";
  if (variant === "accent") className += "button-accent";
  if (variant === "success") className += "button-success";

  if (variant === "choice") {
    className += "button-choice";
    if (isCorrect) className += " correct";
    if (isWrong) className += " wrong";
  }

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
