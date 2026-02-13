import type { Quiz } from "@/app/data/types"

export const japaneseN3Quiz: Quiz = {
  id: "japanese-n3",
  title: "日本語検定 N3",
  description: "文法・語彙・読解・聴解（N3）",
  questions: [
    {
      id: 1,
      question: "この資料は会議までに（　）おいてください。",
      choices: ["準備して", "準備し", "準備する", "準備した"],
      correctIndex: 0,
      explanation: "『〜ておく』は“前もって〜する”の意味。『準備しておいてください』が自然です。",
    },
    {
      id: 2,
      question: "忙しいので、今日は早めに帰る（　）です。",
      choices: ["予定", "つもり", "はず", "よう"],
      correctIndex: 1,
      explanation: "『〜つもりです』は意思・予定を表します。",
    },
    {
      id: 3,
      question: "電車が遅れた（　）、会議に間に合わなかった。",
      choices: ["ために", "ので", "のに", "ところ"],
      correctIndex: 1,
      explanation: "原因・理由は『〜ので』。『のに』は逆接（予想に反する）です。",
    },
    {
      id: 4,
      question: "彼はいつも約束を（　）。",
      choices: ["守る", "守れる", "守られる", "守った"],
      correctIndex: 0,
      explanation: "『約束を守る』で“約束どおりにする”の意味。基本形は『守る』。",
    },
    {
      id: 5,
      question: "【聴解】読み上げを聞いて、内容に合うものを選んでください。",
      listeningText: "すみません、明日の打ち合わせですが、開始時間を30分遅らせてもいいでしょうか。",
      choices: [
        "明日の打ち合わせを30分早めたい",
        "明日の打ち合わせを30分遅らせたい",
        "明日の打ち合わせを中止したい",
        "明日の打ち合わせを別の日にしたい",
      ],
      correctIndex: 1,
      explanation: "『開始時間を30分遅らせてもいいでしょうか』＝“30分遅らせたい”という依頼です。",
    },
  ],
}
