import type { Question } from "@/app/data/types"
import { architectureQuestions } from "./architecture"
import { civilQuestions } from "./civil"
import { electricQuestions } from "./electric"
import { hvacQuestions } from "./hvac"
import { plantQuestions } from "./plant"
import { managementQuestions } from "./management"
import { toolsQuestions } from "./tools"

export const constructionQuestions: Question[] = [
  ...architectureQuestions,
  ...civilQuestions,
  ...electricQuestions,
  ...hvacQuestions,
  ...plantQuestions,
  ...managementQuestions,
  ...toolsQuestions,
]
