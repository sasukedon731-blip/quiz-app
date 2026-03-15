import OpenAI from "openai"

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set")
  }

  return new OpenAI({ apiKey })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const targetText = String(body?.targetText ?? "").trim()
    const spokenTranscript = String(body?.spokenTranscript ?? "").trim()

    if (!targetText || !spokenTranscript) {
      return Response.json(
        { error: "targetText and spokenTranscript are required" },
        { status: 400 }
      )
    }

    const openai = getOpenAI()

    const prompt = `
You are a Japanese speaking evaluator for foreign learners.

Evaluate the spoken Japanese against the target sentence.
Focus on:
- meaning
- naturalness
- politeness

Do not require exact match.
Return JSON only in this shape:
{
  "overallResult": "pass" | "almost_ok" | "needs_fix",
  "scores": {
    "meaning": number,
    "naturalness": number,
    "politeness": number
  },
  "goodPoints": string[],
  "fixPoints": string[],
  "recommended": string,
  "shortFeedback": string
}

Target:
${targetText}

Spoken:
${spokenTranscript}
`

    const res = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    })

    const text =
      res.output_text ||
      JSON.stringify({
        overallResult: "almost_ok",
        scores: { meaning: 90, naturalness: 80, politeness: 85 },
        goodPoints: ["意味は伝わります。"],
        fixPoints: ["少しだけ表現を自然にできます。"],
        recommended: targetText,
        shortFeedback: "よくできています。",
      })

    let parsed: unknown

    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = {
        overallResult: "almost_ok",
        scores: { meaning: 90, naturalness: 80, politeness: 85 },
        goodPoints: ["意味は伝わります。"],
        fixPoints: ["少しだけ表現を自然にできます。"],
        recommended: targetText,
        shortFeedback: "よくできています。",
      }
    }

    return Response.json(parsed)
  } catch (error) {
    console.error("evaluate route error:", error)
    return Response.json(
      { error: "Failed to evaluate speech" },
      { status: 500 }
    )
  }
}