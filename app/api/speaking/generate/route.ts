// app/api/speaking/generate/route.ts

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

    const sourceText = String(body?.sourceText ?? "").trim()
    const sourceLanguage = String(body?.sourceLanguage ?? "en")
    const scene = String(body?.scene ?? "work")
    const politeness = String(body?.politeness ?? "polite")

    if (!sourceText) {
      return Response.json(
        { error: "sourceText is required" },
        { status: 400 }
      )
    }

    const openai = getOpenAI()

    const prompt = `
You are a Japanese expression coach for foreign learners.

Convert the user's text into 3 natural Japanese candidate sentences.
Return JSON only in this shape:
{
  "candidates": [
    { "id": "c1", "japanese": "...", "reading": "...", "note": "..." },
    { "id": "c2", "japanese": "...", "reading": "...", "note": "..." },
    { "id": "c3", "japanese": "...", "reading": "...", "note": "..." }
  ]
}

Rules:
- scene: ${scene}
- politeness: ${politeness}
- sourceLanguage: ${sourceLanguage}
- Make the 1st the best recommendation
- reading should be mainly hiragana
- note should be short
- useful for real life or work
- JSON only

User text:
${sourceText}
`

    const res = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    })

    const text =
      res.output_text ||
      `{"candidates":[{"id":"c1","japanese":"明日、お休みをいただきたいです。","reading":"あした、おやすみをいただきたいです。","note":"丁寧な表現です。"}]}`

    let parsed: unknown

    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = {
        candidates: [
          {
            id: "c1",
            japanese: "明日、お休みをいただきたいです。",
            reading: "あした、おやすみをいただきたいです。",
            note: "丁寧な表現です。",
          },
        ],
      }
    }

    return Response.json(parsed)
  } catch (error) {
    console.error("generate route error:", error)
    return Response.json(
      { error: "Failed to generate Japanese candidates" },
      { status: 500 }
    )
  }
}