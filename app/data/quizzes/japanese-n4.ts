// app/data/quizzes/japanese-n4.ts
import type { Question } from "../types"

export const questions: Question[] = [
  {
    id: 1,
    question: "「つくえ」の正しい漢字はどれですか？",
    choices: ["机", "卓", "台", "棚"],
    correctIndex: 0,
    explanation: "「つくえ」は漢字で「机」と書きます。"
  },
  {
    id: 2,
    question: "「毎日（まいにち）」の意味として正しいものは？",
    choices: ["ときどき", "毎週", "毎月", "一日も欠かさず"],
    correctIndex: 3,
    explanation: "「毎日」は一日も欠かさず、という意味です。"
  },
  {
    id: 3,
    question: "「雨がふっています。」の正しい意味は？",
    choices: ["これから雨がふる", "今雨がふっている", "雨がふった", "雨はふらない"],
    correctIndex: 1,
    explanation: "「〜ています」は今まさにその動作が続いていることを表します。"
  },
  {
    id: 4,
    question: "「あぶないから、さわらないでください。」の意味は？",
    choices: ["さわってもいい", "さわらなくてもいい", "さわってはいけない", "さわる予定だ"],
    correctIndex: 2,
    explanation: "「〜ないでください」は禁止や注意を表します。"
  },
  {
    id: 5,
    question: "「会議は3時からです。」の正しい理解は？",
    choices: ["3時まで", "3時ごろ", "3時ちょうどに終わる", "3時に始まる"],
    correctIndex: 3,
    explanation: "「〜から」は開始時間を表します。"
  },
  {
    id: 6,
    question: "「ゆっくり話してください。」の意味は？",
    choices: ["大きな声で話す", "早く話す", "速さを落として話す", "話さなくていい"],
    correctIndex: 2,
    explanation: "「ゆっくり」は速さを落とすという意味です。"
  },
  {
    id: 7,
    question: "「電車に乗りおくれました。」の意味は？",
    choices: ["電車に早く乗った", "電車に間に合わなかった", "電車を待っている", "電車が止まった"],
    correctIndex: 1,
    explanation: "「乗りおくれる」は間に合わないという意味です。"
  },
  {
    id: 8,
    question: "「もう一度言ってください。」の意味は？",
    choices: ["もう言わないで", "一回だけ言って", "もう一回言って", "あとで言って"],
    correctIndex: 2,
    explanation: "「もう一度」は再度、という意味です。"
  },
  {
    id: 9,
    question: "「静かにしてください。」はどんな場面？",
    choices: ["騒いでいい", "注意している", "感謝している", "許可している"],
    correctIndex: 1,
    explanation: "「静かにしてください」は注意やお願いの表現です。"
  },
  {
    id: 10,
    question: "「入口」はどこですか？",
    choices: ["入るところ", "出るところ", "止まるところ", "休むところ"],
    correctIndex: 0,
    explanation: "「入口」は中に入る場所です。"
  }
]
