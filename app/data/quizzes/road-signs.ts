import type { Quiz } from "@/app/data/types"

export const roadSignsQuiz: Quiz = {
  id: "road-signs",
  title: "道路標識マスター",
  description: "日本の道路標識を覚えよう",

  questions: [
    {
      id: 1,
      sectionId: "all",
      question: "この標識の意味は？",
      signId: "326",
      choices: ["駐車禁止", "駐停車禁止", "進入禁止", "徐行"],
      correctIndex: 1,
      explanation: "赤い×は駐停車禁止。停車も駐車もできません。",
    },
  ],
}