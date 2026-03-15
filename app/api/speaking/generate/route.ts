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

Return JSON only in this exact format:
{
  "candidates": [
    { "id": "c1", "japanese": "...", "reading": "...", "note": "..." },
    { "id": "c2", "japanese": "...", "reading": "...", "note": "..." },
    { "id": "c3", "japanese": "...", "reading": "...", "note": "..." }
  ]
}

Rules:
- sourceLanguage: ${sourceLanguage}
- scene: ${scene}
- politeness: ${politeness}
- first sentence should be the best recommendation
- reading should be mainly hiragana
- note should be short
- useful for real work or daily life
- output JSON only

User text:
${sourceText}
`

    const res = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    })

    const text = res.output_text?.trim()

    if (!text) {
      throw new Error("OpenAI returned empty output")
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      console.error("JSON parse failed. raw text:", text)
      throw new Error("OpenAI response was not valid JSON")
    }

    const candidates = (parsed as { candidates?: unknown[] })?.candidates

    if (!Array.isArray(candidates)) {
      throw new Error("Candidates array is missing")
    }

    return Response.json({ candidates })
  } catch (error) {
    console.error("generate route error:", error)
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate Japanese candidates",
      },
      { status: 500 }
    )
  }
}