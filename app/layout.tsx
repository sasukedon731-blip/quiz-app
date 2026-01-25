import "./globals.css";
import React, { ReactNode } from "react";

export const metadata = {
  title: "外国免許切替クイズ",
  description: "外国人向け免許切替試験対策クイズアプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
