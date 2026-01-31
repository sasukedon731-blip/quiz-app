// app/data/types.ts
export type Question = {
  id: number           // 問題番号
  question: string     // 問題文
  choices: string[]    // 選択肢
  correctIndex: number // 正解番号（0スタート）
  explanation: string  // 解説
}
