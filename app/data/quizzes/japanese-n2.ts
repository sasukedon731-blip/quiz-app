import type { Quiz } from "@/app/data/types"

export const japaneseN2Quiz: Quiz = {
  id: "japanese-n2",
  title: "日本語検定 N2",
  description: "文法・語彙・読解・聴解（N2）",
  questions: [
    {
      id: 1,
      question: "彼は忙しい（　）、時間を作って手伝ってくれた。",
      choices: ["ところを", "にもかかわらず", "にすぎず", "に応じて"],
      correctIndex: 1,
      explanation: "『忙しいにもかかわらず』＝“忙しいのに（予想に反して）”。",
    },
    {
      id: 2,
      question: "この計画はリスクが高い。慎重に進める（　）だ。",
      choices: ["べき", "らしい", "わけ", "もの"],
      correctIndex: 0,
      explanation: "『〜べきだ』は“そうするのが望ましい/当然”という強い勧告。",
    },
    {
      id: 3,
      question: "新しいルールは、状況に（　）見直す必要がある。",
      choices: ["対して", "つれて", "応じて", "かけて"],
      correctIndex: 2,
      explanation: "『状況に応じて』＝“状況に合わせて”。",
    },
    {
      id: 4,
      question: "彼の説明は分かりやすい（　）、結論がはっきりしない。",
      choices: ["反面", "おかげで", "さらに", "そのうえ"],
      correctIndex: 0,
      explanation: "『A反面B』は“良い面と悪い面/対照”を表す。",
    },
    {
      id: 5,
      question: "【聴解】読み上げを聞いて、最も近い内容を選んでください。",
      listeningText: "この件は、念のためもう一度確認してから、改めてご連絡いたします。",
      choices: [
        "今すぐ連絡する", 
        "確認せずに連絡する",
        "確認してから改めて連絡する",
        "連絡は不要だ",
      ],
      correctIndex: 2,
      explanation: "『念のため確認してから、改めてご連絡』＝“確認後に再度連絡する”。",
    },
  ],
}
