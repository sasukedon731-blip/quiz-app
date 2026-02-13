import type { Quiz } from "@/app/data/types"

export const denkiSekou2kyu1ji: Quiz = {
  id: "denki-sekou-2kyu-1ji",
  title: "2級電気施工管理技士 1次",
  description: "施工管理（電気）一次の基礎",
  questions: [
    {
      id: 1,
      question: "作業前に行う『停電確認・無電圧確認』の目的として正しいものはどれ？",
      choices: [
        "照明を明るくするため",
        "感電の危険を防ぐため",
        "工具の消耗を減らすため",
        "作業員の人数を減らすため",
      ],
      correctIndex: 1,
      explanation: "無電圧確認は感電防止の基本です。",
    },
    {
      id: 2,
      question: "電気工事での『ロックアウト／タグアウト（LOTO）』に最も近いものはどれ？",
      choices: [
        "工具を整理整頓する",
        "電源を遮断し、誤投入されないよう施錠・表示する",
        "作業員の名札を付ける",
        "作業時間を短縮する",
      ],
      correctIndex: 1,
      explanation: "LOTOは誤投入による感電・挟まれ等を防ぐ安全手順です。",
    },
    {
      id: 3,
      question: "『接地（アース）』の主な目的として正しいものはどれ？",
      choices: [
        "電流を増やす",
        "漏電時に電気を大地へ逃がし、感電・火災を防ぐ",
        "配線を見えなくする",
        "電圧を永久に一定にする",
      ],
      correctIndex: 1,
      explanation: "接地は漏電時の安全確保（保護）に重要です。",
    },
    {
      id: 4,
      question: "ケーブル布設の基本として不適切なものはどれ？",
      choices: [
        "最小曲げ半径を守る",
        "張力をかけすぎない",
        "鋭利な角に直接こすらせる",
        "保護材や支持間隔を守る",
      ],
      correctIndex: 2,
      explanation: "鋭利な角は被覆損傷の原因。保護材で養生します。",
    },
    {
      id: 5,
      question: "【用語】『絶縁抵抗測定』で確認したいことに最も近いものはどれ？",
      choices: [
        "回路の絶縁状態（漏電しやすさ）",
        "照明の明るさ",
        "作業員の技能",
        "ケーブルの色",
      ],
      correctIndex: 0,
      explanation: "絶縁抵抗は漏電リスクの把握に重要です。",
    },
  ],
}
